<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({ name: 'FlightDetail' });

const route = useRoute();
const router = useRouter();

const detailUrl = computed(() => {
  const search = new URLSearchParams();
  search.set('flightId', String(route.params.flightId ?? ''));
  Object.entries(route.query).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => item && search.append(key, item));
    else if (value !== null && value !== undefined) search.set(key, String(value));
  });
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${baseUrl}flight-detail/index.html?${search.toString()}`;
});

function handleDetailMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin || event.data !== 'flight-detail:back') return;
  void router.push({
    name: route.path.startsWith('/demo/') ? 'FlightPlanDemo' : 'FlightPlan',
  });
}

onMounted(() => window.addEventListener('message', handleDetailMessage));
onBeforeUnmount(() => window.removeEventListener('message', handleDetailMessage));
</script>

<template>
  <div class="flight-detail-host">
    <iframe
      :src="detailUrl"
      class="flight-detail-frame"
      title="航班运行任务中心"
    ></iframe>
  </div>
</template>

<style scoped>
.flight-detail-host {
  width: 100%;
  min-width: 0;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  background: #edf0f3;
}

.flight-detail-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #edf0f3;
}
</style>
