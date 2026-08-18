#!/usr/bin/env bash

set -Eeuo pipefail

umask 022

readonly DEPLOY_ROOT="${STARJET_SOC_ADMIN_DEPLOY_DIR:-/home/starjet/starjet_soc_admin}"
readonly PACKAGE_PATH="${STARJET_SOC_ADMIN_PACKAGE_PATH:-${DEPLOY_ROOT}/package.tgz}"
readonly RELEASES_DIR="${DEPLOY_ROOT}/releases"
readonly CURRENT_LINK="${DEPLOY_ROOT}/current"
readonly LOCK_DIR="${DEPLOY_ROOT}/.deploy.lock"
readonly REQUESTED_RELEASE_ID="${STARJET_SOC_ADMIN_RELEASE_ID:-$(date '+%Y%m%d-%H%M%S')}"

STAGING_DIR=''
NEXT_LINK=''
LOCK_ACQUIRED='false'

log() {
  printf '[starjet-soc-admin] %s\n' "$*"
}

fail() {
  printf '[starjet-soc-admin] ERROR: %s\n' "$*" >&2
  exit 1
}

atomic_replace_link() {
  local source_link="$1"
  local target_link="$2"

  if [[ "$(uname -s)" == 'Darwin' ]]; then
    mv -fh -- "${source_link}" "${target_link}"
  else
    mv -Tf -- "${source_link}" "${target_link}"
  fi
}

cleanup() {
  if [[ -n "${NEXT_LINK}" && -L "${NEXT_LINK}" ]]; then
    rm -f -- "${NEXT_LINK}"
  fi
  if [[ -n "${STAGING_DIR}" && -d "${STAGING_DIR}" ]]; then
    rm -rf -- "${STAGING_DIR}"
  fi
  if [[ "${LOCK_ACQUIRED}" == 'true' ]]; then
    rmdir -- "${LOCK_DIR}" 2>/dev/null || true
  fi
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

command -v tar >/dev/null 2>&1 || fail '未找到 tar 命令'

mkdir -p -- "${DEPLOY_ROOT}" "${RELEASES_DIR}"

[[ -f "${PACKAGE_PATH}" ]] || fail "部署包不存在：${PACKAGE_PATH}"
[[ -s "${PACKAGE_PATH}" ]] || fail "部署包为空：${PACKAGE_PATH}"

# 同一时间只允许一个部署任务修改 releases/current。
mkdir -- "${LOCK_DIR}" 2>/dev/null || fail "已有部署任务正在执行；如确认没有任务，请删除过期锁：${LOCK_DIR}"
LOCK_ACQUIRED='true'

release_id="${REQUESTED_RELEASE_ID}"
release_dir="${RELEASES_DIR}/${release_id}"
suffix=1
while [[ -e "${release_dir}" ]]; do
  printf -v release_id '%s-%02d' "${REQUESTED_RELEASE_ID}" "${suffix}"
  release_dir="${RELEASES_DIR}/${release_id}"
  ((suffix += 1))
done

previous_release=''
if [[ -L "${CURRENT_LINK}" ]]; then
  previous_release="$(readlink "${CURRENT_LINK}")"
elif [[ -e "${CURRENT_LINK}" ]]; then
  fail "current 已存在但不是软链接：${CURRENT_LINK}"
fi

STAGING_DIR="$(mktemp -d "${RELEASES_DIR}/.${release_id}.tmp.XXXXXX")"
log "正在解压 ${PACKAGE_PATH} 到临时目录"
tar \
  --extract \
  --gzip \
  --file="${PACKAGE_PATH}" \
  --directory="${STAGING_DIR}" \
  --no-same-owner \
  --no-same-permissions

if [[ ! -s "${STAGING_DIR}/index.html" ]]; then
  fail '制品根目录中没有 index.html；请取消勾选云效“制品中包含打包路径的目录”'
fi

mv -- "${STAGING_DIR}" "${release_dir}"
STAGING_DIR=''

# 先创建临时软链接，再原子替换 current，避免切换过程出现空窗。
NEXT_LINK="${DEPLOY_ROOT}/.current.${release_id}.tmp"
ln -s "releases/${release_id}" "${NEXT_LINK}"
atomic_replace_link "${NEXT_LINK}" "${CURRENT_LINK}"
NEXT_LINK=''

log "部署成功：${release_dir}"
log "当前版本：$(readlink "${CURRENT_LINK}")"
if [[ -n "${previous_release}" ]]; then
  log "上一版本：${previous_release}"
fi
log "部署包已保留：${PACKAGE_PATH}"
