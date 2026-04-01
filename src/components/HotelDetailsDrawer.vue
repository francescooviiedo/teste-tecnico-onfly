<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="right"
    full-height
  >
    <q-card class="hotel-drawer column">
      <q-card-section class="hotel-drawer__header no-wrap">
        <div class="hotel-drawer__title ellipsis" v-if="hotelStore.selectedHotelDetails">
          {{ hotelStore.selectedHotelDetails.name }}
        </div>
        <div class="hotel-drawer__title" v-else>Carregando...</div>
        <q-btn icon="close" flat round dense v-close-popup color="grey-8" />
      </q-card-section>
      <q-card-section
        v-if="hotelStore.loadingDetails || !hotelStore.selectedHotelDetails"
        class="col flex flex-center"
      >
        <q-spinner color="primary" size="3em" />
      </q-card-section>
      <q-card-section v-else class="hotel-drawer__content col scroll">
        <div class="hotel-drawer__carousel-container">
          <q-carousel
            animated
            v-model="slide"
            navigation
            arrows
            infinite
            :autoplay="false"
            class="hotel-drawer__carousel"
          >
            <template v-slot:navigation-icon="{ active, onClick }">
              <q-btn v-if="active" size="4px" round color="white" flat class="q-mx-xs" />
              <q-btn v-else size="4px" round color="grey-5" flat class="q-mx-xs" @click="onClick" />
            </template>
            <template v-slot:control>
              <div class="hotel-drawer__carousel-stars">
                <q-rating
                  :model-value="Number(hotelStore.selectedHotelDetails.stars)"
                  max="5"
                  size="12px"
                  color="primary"
                  readonly
                />
              </div>
            </template>
            <q-carousel-slide
              v-for="(img, index) in hotelStore.selectedHotelDetails.images"
              :key="index"
              :name="index"
              :img-src="img"
            />
          </q-carousel>
        </div>
        <div class="hotel-drawer__section">
          <h3 class="hotel-drawer__section-title">Comodidades</h3>
          <div class="hotel-drawer__amenities">
            <div
              v-for="amenity in hotelStore.selectedHotelDetails.amenities"
              :key="amenity.key"
              class="hotel-drawer__amenity"
            >
              <q-icon :name="getAmenityIcon(amenity.key)" size="sm" color="grey-8" />
              <span class="hotel-drawer__amenity-label">{{ amenity.label }}</span>
            </div>
          </div>
        </div>
        <div class="hotel-drawer__section">
          <h3 class="hotel-drawer__section-title">Localização</h3>
          <p class="hotel-drawer__section-text">
            {{ hotelStore.selectedHotelDetails.fullAddress }}
          </p>
        </div>
        <div class="hotel-drawer__section">
          <h3 class="hotel-drawer__section-title">
            Sobre o {{ hotelStore.selectedHotelDetails.name }}
          </h3>
          <p class="hotel-drawer__section-text">
            {{ hotelStore.selectedHotelDetails.description }}
          </p>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useHotelStore } from 'src/stores/hotelStore';

defineProps<{ modelValue: boolean }>();
defineEmits(['update:modelValue']);

const hotelStore = useHotelStore();
const slide = ref(0);

watch(
  () => hotelStore.selectedHotelDetails,
  () => {
    slide.value = 0;
  },
);

const getAmenityIcon = (key: string) => {
  const map: Record<string, string> = {
    WI_FI: 'wifi',
    PARKING: 'local_parking',
    POOL: 'pool',
    RESTAURANT: 'restaurant',
    AIR_CONDITIONING: 'ac_unit',
    FITNESS_CENTER: 'fitness_center',
    SPA: 'spa',
    SAFE: 'lock',
    ROOM_SERVICE: 'room_service',
    STEAM_ROOM: 'hot_tub',
    PET_FRIENDLY: 'pets',
  };
  return map[key] || 'check_circle';
};
</script>
