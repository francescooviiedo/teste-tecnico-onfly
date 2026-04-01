<template>
  <div class="search-box">
    <div class="search-box__tabs">
      <div class="search-box__tab search-box__tab--disabled">
        <q-icon name="flight" class="search-box__tab-icon" />
        <span>Aéreo</span>
      </div>
      <div class="search-box__tab search-box__tab--active">
        <q-icon name="hotel" class="search-box__tab-icon" />
        <span>Hotel</span>
      </div>
      <div class="search-box__tab search-box__tab--disabled">
        <q-icon name="directions_car" class="search-box__tab-icon" />
        <span>Carro</span>
      </div>
      <div class="search-box__tab search-box__tab--disabled">
        <q-icon name="directions_bus" class="search-box__tab-icon" />
        <span>Ônibus</span>
      </div>
    </div>

    <div class="search-box__bar" ref="searchBar">
      <div class="search-box__input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="search-box__input"
          placeholder="Destino"
          @input="handleInput"
          @focus="showResults = true"
          @keydown="handleKeyDown"
        />
        <div
          v-if="showResults && (hotelStore.cities.length > 0 || hotelStore.loading)"
          class="search-box__results"
        >
          <div
            v-if="hotelStore.loading"
            class="search-box__result-item search-box__result-item--loading"
          >
            <q-spinner-dots size="24px" />
            <span>Buscando...</span>
          </div>
          <template v-else>
            <div
              v-for="(city, index) in hotelStore.cities"
              :key="city.placeId"
              class="search-box__result-item"
              :class="{ 'search-box__result-item--active': index === selectedIndex }"
              @click="selectCity(city)"
              @mouseenter="selectedIndex = index"
            >
              <q-icon name="location_on" size="xs" color="grey-7" />
              <span>{{ city.name }}, {{ city.state.name }}</span>
            </div>
          </template>
        </div>
        <div
          v-if="
            showResults &&
            !hotelStore.loading &&
            searchQuery.length >= 3 &&
            hotelStore.cities.length === 0
          "
          class="search-box__results"
        >
          <div class="search-box__result-item search-box__result-item--empty">
            Nenhuma cidade encontrada.
          </div>
        </div>
      </div>
      <button class="search-box__button" @click="handleManualSearch">
        <q-icon name="search" class="search-box__button-icon" />
        Buscar Hotel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useHotelStore } from 'src/stores/hotelStore';
import type { City } from 'src/stores/hotelStore';

const hotelStore = useHotelStore();
const searchQuery = ref('');
const showResults = ref(false);
const selectedIndex = ref(-1);

const handleInput = () => {
  selectedIndex.value = -1;
  if (searchQuery.value.length >= 3) {
    hotelStore.searchCities(searchQuery.value).catch(console.error);
    showResults.value = true;
  } else {
    hotelStore.cities = [];
    showResults.value = false;
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!showResults.value || hotelStore.cities.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      selectedIndex.value = (selectedIndex.value + 1) % hotelStore.cities.length;
      break;
    case 'ArrowUp':
      e.preventDefault();
      selectedIndex.value =
        (selectedIndex.value - 1 + hotelStore.cities.length) % hotelStore.cities.length;
      break;
    case 'Enter':
      e.preventDefault();
      if (selectedIndex.value >= 0) {
        selectCity(hotelStore.cities[selectedIndex.value]!);
      }
      break;
    case 'Escape':
      showResults.value = false;
      break;
  }
};

const selectCity = (city: City) => {
  searchQuery.value = `${city.name}, ${city.state.name}`;
  hotelStore.selectCity(city);
  showResults.value = false;
  hotelStore.fetchHotelsByCity(city.placeId).catch(console.error);
};

const handleManualSearch = () => {
  if (hotelStore.selectedCity) {
    hotelStore.fetchHotelsByCity(hotelStore.selectedCity.placeId).catch(console.error);
  } else if (searchQuery.value.length >= 3) {
    if (hotelStore.cities.length > 0) {
      const firstCity = hotelStore.cities[0];
      if (firstCity) selectCity(firstCity);
    }
  }
};

const searchBar = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (searchBar.value && !searchBar.value.contains(event.target as Node)) {
    showResults.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
