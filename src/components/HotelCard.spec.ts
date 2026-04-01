import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HotelCard from './HotelCard.vue';
import type { Hotel } from 'src/stores/hotelStore';

describe('HotelCard.vue', () => {
  const mockHotel: Hotel = {
    id: 1,
    name: 'Test Hotel',
    stars: '4',
    district: 'Centro',
    amenities: ['WI_FI', 'POOL'],
    hasRefundableRoom: true,
    hasBreakFast: true,
    dailyPrice: 5000,
    tax: 2000,
    totalPrice: 12000,
    thumb: 'hotel.jpg',
    placeId: 1,
  };

  it('deve renderizar as informações do hotel corretamente', () => {
    const wrapper = mount(HotelCard, {
      props: { hotel: mockHotel },
      global: {
        stubs: {
          'q-img': { template: '<div class="q-img-stub"><slot /></div>' },
          'q-rating': true,
          'q-icon': true,
        },
      },
    });

    expect(wrapper.find('.hotel-card__title').text()).toBe('Test Hotel');
    expect(wrapper.find('.hotel-card__district').text()).toBe('Centro');
    expect(wrapper.findAll('.hotel-card__amenity')).toHaveLength(2);
    expect(wrapper.text()).toContain('Reembolsável');
    expect(wrapper.text()).toContain('Café da manhã');
  });

  it('deve renderizar os preços corretamente no formato pt-BR', () => {
    const wrapper = mount(HotelCard, {
      props: { hotel: mockHotel },
      global: {
        stubs: { 'q-img': true, 'q-rating': true, 'q-icon': true },
      },
    });

    const text = wrapper.text();
    expect(text).toContain('50');
    expect(text).toMatch(/50[,.]00/);
    expect(text).toContain('120');
    expect(text).toContain('Total');
  });

  it('deve emitir o evento open-details quando o botão for clicado', async () => {
    const wrapper = mount(HotelCard, {
      props: { hotel: mockHotel },
      global: {
        stubs: { 'q-img': true, 'q-rating': true, 'q-icon': true },
      },
    });

    await wrapper.find('.hotel-card__button').trigger('click');
    expect(wrapper.emitted('open-details')).toBeTruthy();
    expect(wrapper.emitted('open-details')![0]).toEqual(['Test Hotel']);
  });
});
