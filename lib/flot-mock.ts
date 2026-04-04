import type { CardData, TokenizeResult, ChargePayload, ChargeResult, SaveResult } from './types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function shortId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const flotMock = {
  async tokenize(cardData: CardData): Promise<TokenizeResult> {
    await delay(1200);
    return {
      token: `tok_${randomId()}`,
      last4: cardData.number.replace(/\s/g, '').slice(-4),
    };
  },

  async charge(_payload: ChargePayload): Promise<ChargeResult> {
    await delay(1800);
    // 95% success in demo
    if (Math.random() > 0.05) {
      return {
        success: true,
        chargeId: `ch_${randomId()}`,
        orderId: `FLT-${shortId()}`,
      };
    }
    return {
      success: false,
      error: 'Insufficient funds. Please try another card.',
    };
  },

  async savePaymentMethod(_token: string): Promise<SaveResult> {
    await delay(600);
    return {
      saved: true,
      profileId: `prof_${randomId()}`,
    };
  },
};
