<template>
  <q-layout view="lHh Lpr lFf">
    <MainHeader />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import MainHeader from 'components/MainHeader.vue';
</script>
