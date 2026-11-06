<script setup>
import { ref } from 'vue';
import InterestBanner from './InterestBanner.vue';
const position = ref(56.125356);
const amount = ref('$23.08');
const message = ref('Click the banner to connect your navigation.');
</script>
<template>
  <main>
    <h1>Local Vue component</h1>
    <label>Position: {{ position }}% <input v-model.number="position" type="range" min="5" max="95" step="0.1"></label>
    <label>Amount <input v-model="amount"></label>
    <div class="container"><InterestBanner template="earning" :position="position" :fields="{'amount': { text: amount }}" @activate="message='Your app opens the Interest screen here.'" /></div>
    <p>{{ message }}</p>
  </main>
</template>
<style>body{font:14px system-ui;background:#eee;margin:24px}main{max-width:744px}label{display:block;margin:20px 0}input{margin-left:10px}.container{width:100%}</style>
