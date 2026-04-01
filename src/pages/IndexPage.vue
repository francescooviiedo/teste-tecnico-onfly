<template>
  <q-page class="onfly-page">
    <section class="onfly-layout__content">
      <HotelSearch />
    </section>

    <section class="onfly-results">
      <div class="onfly-results__container">
        <div class="hotel-filters" v-if="hotelStore.hotels.length > 0">
          <div class="hotel-filters__select">
            <q-select
              v-model="hotelStore.filters.orderBy"
              :options="sortOptions"
              :display-value="`Ordenar por: ${sortOptions.find((opt) => opt.value === hotelStore.filters.orderBy)?.label || 'Preço'}`"
              borderless
              dense
              emit-value
              map-options
              class="full-width"
            >
              <template v-slot:prepend>
                <q-icon name="swap_vert" size="sm" class="q-mr-sm" />
              </template>
            </q-select>
          </div>
          <div class="hotel-filters__search">
            <q-input
              v-model="hotelStore.filters.name"
              placeholder="Nome do hotel"
              borderless
              dense
              class="full-width"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="16px" />
              </template>
            </q-input>
          </div>
        </div>
        <div v-if="hotelStore.filteredAndSortedHotels.length > 0">
          <HotelCard
            v-for="hotel in hotelStore.paginatedHotels"
            :key="hotel.id"
            :hotel="hotel"
            @open-details="openHotelDetails"
          />
        </div>

        <div
          v-else-if="
            hotelStore.hotels.length > 0 && hotelStore.filteredAndSortedHotels.length === 0
          "
          class="text-center q-mt-xl"
        >
          <q-icon name="search_off" size="xl" color="grey-5" />
          <div class="text-h6 text-grey-7">Nenhum hotel corresponde a esse nome.</div>
        </div>
        <div class="onfly-pagination" v-if="hotelStore.filteredAndSortedHotels.length > 0">
          <span>{{ paginationText }}</span>
          <button
            class="onfly-pagination__btn"
            :disabled="hotelStore.pagination.page === 1"
            @click="prevPage"
          >
            <q-icon name="chevron_left" size="xs" />
          </button>
          <button
            class="onfly-pagination__btn"
            :disabled="hotelStore.pagination.page === hotelStore.totalPages"
            @click="nextPage"
          >
            <q-icon name="chevron_right" size="xs" />
          </button>
        </div>
        <div
          v-else-if="
            !hotelStore.loading && hotelStore.selectedCity && hotelStore.hotels.length === 0
          "
          class="text-center q-mt-xl"
        >
          <q-icon name="info" size="xl" color="grey-5" />
          <div class="text-h6 text-grey-7">Nenhum hotel encontrado para esta cidade.</div>
        </div>
      </div>
    </section>
    <HotelDetailsDrawer v-model="detailsDrawerOpen" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import HotelSearch from 'components/HotelSearch.vue';
import HotelCard from 'components/HotelCard.vue';
import HotelDetailsDrawer from 'components/HotelDetailsDrawer.vue';
import { useHotelStore } from 'src/stores/hotelStore';

const hotelStore = useHotelStore();
const detailsDrawerOpen = ref(false);

const openHotelDetails = (name: string) => {
  detailsDrawerOpen.value = true;
  hotelStore.fetchHotelDetails(name).catch(console.error);
};

const sortOptions = [
  { label: 'Preço', value: 'price' },
  { label: 'Estrelas', value: 'stars' },
];

const paginationText = computed(() => {
  const start = (hotelStore.pagination.page - 1) * hotelStore.pagination.rowsPerPage + 1;
  const end = Math.min(
    hotelStore.pagination.page * hotelStore.pagination.rowsPerPage,
    hotelStore.filteredAndSortedHotels.length,
  );
  return `${start}-${end} de ${hotelStore.filteredAndSortedHotels.length}`;
});

const prevPage = () => {
  if (hotelStore.pagination.page > 1) {
    hotelStore.pagination.page--;
  }
};

const nextPage = () => {
  if (hotelStore.pagination.page < hotelStore.totalPages) {
    hotelStore.pagination.page++;
  }
};

watch(
  () => [hotelStore.filters.orderBy, hotelStore.filters.name],
  () => {
    hotelStore.pagination.page = 1;
  },
);

defineExpose({ hotelStore, detailsDrawerOpen });
</script>
