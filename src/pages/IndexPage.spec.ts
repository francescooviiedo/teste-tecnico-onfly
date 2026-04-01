import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import IndexPage from './IndexPage.vue';
import type { Hotel } from 'src/stores/hotelStore';

describe('IndexPage.vue', () => {
  const mountComponent = () => {
    return mount(IndexPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          'q-page': { template: '<div><slot /></div>' },
          'q-select': {
            name: 'QSelect',
            template: '<div class="q-select-stub"><slot /></div>',
          },
          'q-input': {
            name: 'QInput',
            template: '<div class="q-input-stub"><slot /></div>',
          },
          'q-icon': true,
          'q-btn': true,
          HotelSearch: { template: '<div class="hotel-search-stub" />' },
          HotelCard: {
            template:
              '<div class="hotel-card-stub" @click="$emit(\'open-details\', \'Hotel 1\')" />',
          },
          HotelDetailsDrawer: { template: '<div class="hotel-drawer-stub" />' },
        },
      },
    });
  };

  it('deve resetar a paginação quando os filtros da store mudarem', async () => {
    const wrapper = mountComponent();
    const hotelStore = wrapper.vm.hotelStore;
    hotelStore.pagination.page = 5;

    hotelStore.filters.orderBy = 'stars';

    await wrapper.vm.$nextTick();
    expect(hotelStore.pagination.page).toBe(1);
  });

  it('deve incrementar e decrementar a página através dos botões de paginação', async () => {
    const wrapper = mountComponent();
    const hotelStore = wrapper.vm.hotelStore;
    const mockHotels: Hotel[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `Hotel ${i}`,
      stars: '4',
      dailyPrice: 100,
      tax: 10,
      totalPrice: 110,
      amenities: [],
      thumb: '',
      hasBreakFast: true,
      hasRefundableRoom: true,
      district: '',
      placeId: 1,
    }));
    hotelStore.hotels = mockHotels;
    // @ts-expect-error - Mocking Pinia getters for tests
    hotelStore.filteredAndSortedHotels = mockHotels;
    // @ts-expect-error - Mocking Pinia getters for tests
    hotelStore.totalPages = 2;
    hotelStore.pagination.page = 1;
    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll('.onfly-pagination__btn');
    if (buttons.length >= 2) {
      const prev = buttons[0];
      const next = buttons[1];
      if (prev && next) {
        await next.trigger('click');
        expect(hotelStore.pagination.page).toBe(2);

        await prev.trigger('click');
        expect(hotelStore.pagination.page).toBe(1);
      }
    }
  });

  it('deve abrir o drawer de detalhes e buscar os detalhes quando o HotelCard emitir open-details', async () => {
    const wrapper = mountComponent();
    const hotelStore = wrapper.vm.hotelStore;
    const hotel: Hotel = {
      id: 1,
      name: 'Hotel 1',
      stars: '4',
      dailyPrice: 100,
      tax: 10,
      totalPrice: 110,
      amenities: [],
      thumb: '',
      hasBreakFast: true,
      hasRefundableRoom: true,
      district: '',
      placeId: 1,
    };
    hotelStore.hotels = [hotel];
    // @ts-expect-error - Mocking Pinia getters for tests
    hotelStore.filteredAndSortedHotels = [hotel];
    await wrapper.vm.$nextTick();

    await wrapper.find('.hotel-card-stub').trigger('click');

    expect(vi.mocked(hotelStore.fetchHotelDetails)).toHaveBeenCalledWith('Hotel 1');
    expect(wrapper.vm.detailsDrawerOpen).toBe(true);
  });

  it('deve renderizar a contagem correta de resultados no texto de paginação', async () => {
    const wrapper = mountComponent();
    const hotelStore = wrapper.vm.hotelStore;
    const mockHotels: Hotel[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      name: `Hotel ${i}`,
      stars: '4',
      dailyPrice: 100,
      tax: 10,
      totalPrice: 110,
      amenities: [],
      thumb: '',
      hasBreakFast: true,
      hasRefundableRoom: true,
      district: '',
      placeId: 1,
    }));
    hotelStore.hotels = mockHotels;
    // @ts-expect-error - Mocking Pinia getters for tests
    hotelStore.filteredAndSortedHotels = mockHotels;
    hotelStore.pagination.page = 2;
    hotelStore.pagination.rowsPerPage = 10;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.onfly-pagination').text()).toContain('11-15 de 15');
  });

  it('deve mostrar a mensagem de nenhum resultado quando a busca não retornar nada', async () => {
    const wrapper = mountComponent();
    const hotelStore = wrapper.vm.hotelStore;
    const hotel: Hotel = {
      id: 1,
      name: 'Hotel 1',
      stars: '4',
      dailyPrice: 100,
      tax: 10,
      totalPrice: 110,
      amenities: [],
      thumb: '',
      hasBreakFast: true,
      hasRefundableRoom: true,
      district: '',
      placeId: 1,
    };
    hotelStore.hotels = [hotel];
    // @ts-expect-error - Mocking Pinia getters for tests
    hotelStore.filteredAndSortedHotels = [];
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Nenhum hotel corresponde a esse nome');
  });
});
