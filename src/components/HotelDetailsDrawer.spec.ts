import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import HotelDetailsDrawer from './HotelDetailsDrawer.vue';
import { useHotelStore, type HotelDetails } from 'src/stores/hotelStore';

describe('HotelDetailsDrawer.vue', () => {
  const mountComponent = () => {
    return mount(HotelDetailsDrawer, {
      props: { modelValue: true },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          'q-dialog': { template: '<div><slot /></div>' },
          'q-card': { template: '<div><slot /></div>' },
          'q-card-section': { template: '<div><slot /></div>' },
          'q-carousel': { template: '<div class="q-carousel-stub"><slot /></div>' },
          'q-carousel-slide': { template: '<div class="q-carousel-slide-stub" />' },
          'q-rating': true,
          'q-btn': true,
          'q-icon': true,
          'q-spinner': { template: '<div class="q-spinner-stub" />' }
        },
        directives: {
          'close-popup': {}
        }
      }
    });
  };

  it('deve renderizar o estado de carregamento quando loadingDetails for true', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();
    hotelStore.loadingDetails = true;
    hotelStore.selectedHotelDetails = null;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.q-spinner-stub').exists()).toBeTruthy();
  });

  it('deve renderizar os detalhes do hotel quando os dados estiverem disponíveis', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();
    hotelStore.loadingDetails = false;
    const details: HotelDetails = {
      id: 1,
      name: 'Luxury Palace',
      description: 'Elegant hotel',
      stars: '5',
      amenities: [{ key: 'WI_FI', label: 'Gratis WiFi' }],
      hasBreakFast: true,
      hasRefundableRoom: true,
      fullAddress: 'Rua das Flores, 100',
      images: ['img1.jpg']
    };
    hotelStore.selectedHotelDetails = details;
    
    await wrapper.vm.$nextTick(); 

    expect(wrapper.find('.hotel-drawer__title').text()).toBe('Luxury Palace');
    expect(wrapper.find('.hotel-drawer__section-text').text()).toBe('Rua das Flores, 100');
    expect(wrapper.text()).toContain('Elegant hotel');
  });

  it('deve renderizar o número correto de conveniências e imagens', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();
    hotelStore.loadingDetails = false;
    const details: HotelDetails = {
      id: 1,
      name: 'Luxury Palace',
      description: 'Elegant hotel',
      stars: '5',
      amenities: [{ key: 'WI_FI', label: 'WiFi' }, { key: 'POOL', label: 'Piscina' }],
      hasBreakFast: true,
      hasRefundableRoom: true,
      fullAddress: 'Rua das Flores, 100',
      images: ['img1.jpg', 'img2.jpg']
    };
    hotelStore.selectedHotelDetails = details;
    
    await wrapper.vm.$nextTick(); 

    expect(wrapper.findAll('.hotel-drawer__amenity')).toHaveLength(2);
    expect(wrapper.findAll('.q-carousel-slide-stub')).toHaveLength(2);
  });
});
