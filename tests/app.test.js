import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../app.vue';

describe('App', () => {
  it('renders the correct content', () => {
    const wrapper = mount(App);

    // Test le texte tel qu'il est dans le composant
    expect(wrapper.text()).toContain('Application test');
  });
});
