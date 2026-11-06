<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import '../../interest-banner.js';

const props = defineProps({
  template: { type: String, default: 'earning' },
  position: { type: Number, default: undefined },
  shape: { type: String, default: undefined },
  backgroundOnly: { type: Boolean, default: false },
  fields: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['activate']);
const mount = ref(null);
let banner;
function sync() {
  if (banner) banner.config = { template: props.template, position: props.position, shape: props.shape, backgroundOnly: props.backgroundOnly, fields: props.fields };
}
function activate() { emit('activate', { template: props.template }); }
function keydown(event) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
}
onMounted(() => {
  banner = document.createElement('interest-banner');
  banner.setAttribute('role', 'button');
  banner.setAttribute('tabindex', '0');
  banner.setAttribute('aria-label', 'Open interest details');
  banner.addEventListener('click', activate);
  banner.addEventListener('keydown', keydown);
  mount.value.append(banner);
  sync();
});
watch(() => [props.template, props.position, props.shape, props.backgroundOnly, props.fields], sync, { deep: true });
onBeforeUnmount(() => { banner?.remove(); banner = null; });
</script>

<template><div ref="mount" class="interest-banner-host" /></template>
<style scoped>.interest-banner-host { width: 100%; height: 122px; }</style>
