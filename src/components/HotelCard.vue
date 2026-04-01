<template>
  <div class="hotel-card">
    <div class="hotel-card__image-container">
      <q-img
        :src="hotel.thumb || '/hotel-image-placeholder.png'"
        class="hotel-card__image"
        position="center"
      >
        <template v-slot:error>
          <img
            :src="'/hotel-image-placeholder.png'"
            alt="Foto do hotel indisponível"
            class="hotel-card__placeholder"
          />
        </template>
      </q-img>
      <div class="hotel-card__stars">
        <q-rating :model-value="Number(hotel.stars)" max="5" size="12px" color="primary" readonly />
      </div>
      <button class="hotel-card__nav hotel-card__nav--left">
        <q-icon name="chevron_left" size="xs" />
      </button>
      <button class="hotel-card__nav hotel-card__nav--right">
        <q-icon name="chevron_right" size="xs" />
      </button>
    </div>
    <div class="hotel-card__content">
      <h3 class="hotel-card__title">{{ hotel.name }}</h3>
      <span class="hotel-card__district">{{ hotel.district }}</span>

      <div class="hotel-card__amenities">
        <div v-for="amenity in hotel.amenities" :key="amenity" class="hotel-card__amenity">
          <q-icon :name="getAmenityIcon(amenity)" size="xs" color="grey-7" />
        </div>
      </div>

      <div class="hotel-card__tags">
        <div v-if="hotel.hasRefundableRoom" class="hotel-card__tag">
          <q-icon name="attach_money" size="xs" />
          <span>Reembolsável</span>
        </div>
        <div v-if="hotel.hasBreakFast" class="hotel-card__tag">
          <q-icon name="local_cafe" size="xs" />
          <span>Café da manhã</span>
        </div>
      </div>
    </div>
    <div class="hotel-card__pricing">
      <span class="hotel-card__pricing-label">Por dia</span>
      <span class="hotel-card__pricing-main">R$ {{ formatPrice(hotel.dailyPrice, false) }}</span>

      <div class="hotel-card__pricing-breakdown">
        <div class="hotel-card__pricing-row">
          <span>Diária</span>
          <span>R$ {{ formatPrice(hotel.dailyPrice) }}</span>
        </div>
        <div class="hotel-card__pricing-row">
          <span>Taxa</span>
          <span>R$ {{ formatPrice(hotel.tax / days) }}</span>
        </div>
        <div class="hotel-card__pricing-row hotel-card__pricing-row--total">
          <span>Total</span>
          <span>R$ {{ formatPrice(hotel.totalPrice, false) }}</span>
        </div>
      </div>
      <button class="hotel-card__button" @click="$emit('open-details', hotel.name)">
        Ver detalhes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Hotel } from 'src/stores/hotelStore';

const props = defineProps<{ hotel: Hotel }>();
defineEmits(['open-details']);

const formatPrice = (cents: number, showDecimals = true) => {
  const amount = cents / 100;
  if (!showDecimals && Number.isInteger(amount)) {
    return amount.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getAmenityIcon = (amenity: string) => {
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
  };
  return map[amenity] || 'check_circle';
};

const days = computed(() => {
  if (!props.hotel.dailyPrice) return 1;
  const d = (props.hotel.totalPrice - props.hotel.tax) / props.hotel.dailyPrice;
  return Math.max(1, Math.round(d));
});
</script>
