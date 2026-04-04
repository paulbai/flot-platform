import type { MenuCategory } from '../types';

export const menu: { categories: MenuCategory[] } = {
  categories: [
    {
      id: 'starters',
      name: 'Starters',
      items: [
        {
          id: 'burrata',
          name: 'Burrata & Heirloom Tomato',
          price: 18,
          description: 'Fresh burrata, roasted cherry tomatoes, aged balsamic, basil oil',
          dietary: ['V', 'GF'],
          popular: true,
        },
        {
          id: 'tuna-tartare',
          name: 'Tuna Tartare',
          price: 24,
          description: 'Yellowfin tuna, avocado, ponzu, sesame crisp',
          dietary: ['GF'],
          popular: false,
        },
        {
          id: 'mushroom-crostini',
          name: 'Wild Mushroom Crostini',
          price: 16,
          description: 'Truffle oil, ricotta, thyme, sourdough',
          dietary: ['V'],
          popular: false,
        },
      ],
    },
    {
      id: 'mains',
      name: 'Main Course',
      items: [
        {
          id: 'ribeye',
          name: '28-Day Aged Ribeye',
          price: 68,
          description: '300g, roasted garlic butter, watercress, triple-cooked chips',
          dietary: ['GF'],
          popular: true,
        },
        {
          id: 'lobster-pasta',
          name: 'Lobster Tagliatelle',
          price: 54,
          description: 'Fresh pasta, half lobster, bisque, chili, parsley',
          dietary: [],
          popular: true,
        },
        {
          id: 'risotto',
          name: 'Wild Mushroom Risotto',
          price: 32,
          description: 'Arborio, porcini, parmesan, truffle',
          dietary: ['V', 'GF'],
          popular: false,
        },
      ],
    },
    {
      id: 'desserts',
      name: 'Desserts',
      items: [
        {
          id: 'tiramisu',
          name: 'Tiramisu Classico',
          price: 14,
          description: 'House-made, Kahlúa, Valrhona cocoa',
          dietary: ['V'],
          popular: true,
        },
        {
          id: 'panna-cotta',
          name: 'Vanilla Panna Cotta',
          price: 12,
          description: 'Berry coulis, pistachio crumb, edible gold',
          dietary: ['V', 'GF'],
          popular: false,
        },
      ],
    },
    {
      id: 'drinks',
      name: 'Drinks',
      items: [
        {
          id: 'negroni',
          name: 'Classic Negroni',
          price: 16,
          description: 'Campari, Vermouth Rosso, Gin, orange peel',
          dietary: ['V', 'GF'],
          popular: true,
        },
        {
          id: 'natural-wine',
          name: 'House Natural Wine',
          price: 12,
          description: 'Rotating selection, ask your server',
          dietary: ['V', 'GF'],
          popular: false,
        },
      ],
    },
  ],
};
