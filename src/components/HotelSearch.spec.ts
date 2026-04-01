/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import HotelSearch from './HotelSearch.vue';
import { useHotelStore, type City } from 'src/stores/hotelStore';

describe('HotelSearch.vue', () => {
  const mountComponent = () => {
    return mount(HotelSearch, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          'q-icon': true,
          'q-spinner-dots': true,
          'q-select': { template: '<div class="q-select-stub"><slot /></div>' },
          'q-input': { template: '<div class="q-input-stub"><slot /></div>' },
          'q-btn': { template: '<div class="q-btn-stub"><slot /></div>' },
        },
        directives: {
          'close-popup': {},
        },
      },
    });
  };

  it('deve disparar a busca de cidades ao digitar 3 ou mais caracteres', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();
    const input = wrapper.find('input');

    await input.setValue('bel');
    expect(hotelStore.searchCities).toHaveBeenCalledWith('bel');
  });

  it('não deve disparar a busca de cidades ao digitar menos de 3 caracteres', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();
    const input = wrapper.find('input');

    await input.setValue('be');
    expect(hotelStore.searchCities).not.toHaveBeenCalled();
  });

  it('deve renderizar os resultados de autocomplete quando houver cidades presentes e o input estiver focado', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();

    const mockCity: City = {
      name: 'Belo Horizonte',
      state: { id: 'MG', name: 'Minas Gerais' },
      placeId: 1,
    };
    hotelStore.cities = [mockCity];
    hotelStore.loading = false;

    await wrapper.find('input').trigger('focus');
    await wrapper.vm.$nextTick();

    const resultItems = wrapper.findAll('.search-box__result-item');
    expect(resultItems.length).toBeGreaterThan(0);
    expect(resultItems[0]?.text()).toContain('Belo Horizonte, Minas Gerais');
  });

  it('deve chamar selectCity e fetchHotelsByCity quando uma cidade for clicada', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();
    const mockCity: City = { name: 'Sampa', state: { id: 'SP', name: 'SP' }, placeId: 2 };

    hotelStore.cities = [mockCity];
    hotelStore.loading = false;
    await wrapper.find('input').trigger('focus');
    await wrapper.vm.$nextTick();

    const item = wrapper.find('.search-box__result-item');
    await item.trigger('click');

    expect(hotelStore.selectCity).toHaveBeenCalledWith(mockCity);
    expect(hotelStore.fetchHotelsByCity).toHaveBeenCalledWith(2);
  });

  it('deve disparar a busca manual pela selectedCity na store', async () => {
    const wrapper = mountComponent();
    const hotelStore = useHotelStore();
    const mockCity: City = { name: 'Rio', state: { id: 'RJ', name: 'Rio de Janeiro' }, placeId: 3 };
    hotelStore.selectedCity = mockCity;

    await wrapper.find('.search-box__button').trigger('click');

    expect(hotelStore.fetchHotelsByCity).toHaveBeenCalledWith(3);
  });
});
