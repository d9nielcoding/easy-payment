<template>
  <q-page class="q-py-md">
    <div class="container">
      <!-- 標題和位置選擇 -->
      <div class="row items-center q-mb-lg">
        <div class="text-h6 q-mr-sm">Collect Payment</div>
        <q-btn flat class="location-btn" padding="4px 8px" text-transform="none">
          <q-icon name="location_on" size="16px" class="q-mr-xs" />
          <span class="text-weight-medium">New York Clinic</span>
          <q-icon name="expand_more" size="20px" class="q-ml-xs" />
        </q-btn>
        <q-space />
        <q-btn
          v-show="total > 0"
          flat
          class="text-negative text-weight-medium"
          label="Reset Payment"
          @click="resetPayment"
        />
      </div>

      <!-- 主要內容區域 -->
      <q-card flat bordered class="main-card">
        <div class="row">
          <!-- 左側區域 -->
          <div class="col-12 col-md-8 payment-input-section">
            <!-- 金額輸入 -->
            <div class="text-center q-mb-xl">
              <div class="text-subtitle1 text-weight-medium text-gray-600 q-mb-md">
                Enter Amount
              </div>
              <div class="amount-input" :class="{ 'is-focused': isInputFocused }">
                <span class="currency-symbol text-gray-900">$</span>
                <input
                  ref="amountInput"
                  type="text"
                  v-model="displayAmount"
                  class="amount text-gray-900 text-weight-bold"
                  inputmode="decimal"
                  @input="handleAmountInput"
                  @focus="handleAmountFocus"
                  @blur="handleAmountBlur"
                />
              </div>
            </div>

            <!-- 描述輸入 -->
            <q-input
              v-model="description"
              label="Description (Optional)"
              filled
              type="textarea"
              class="description-input"
              rounded
              borderless
              autogrow
            />
          </div>

          <!-- 右側區域 -->
          <div class="col-12 col-md-4 summary-section">
            <!-- Summary Section -->
            <div class="summary-content">
              <div class="text-h6 q-mb-lg text-weight-bold">Summary</div>

              <!-- 小計 -->
              <div class="row justify-between q-mb-sm">
                <div class="text-gray-500">Subtotal</div>
                <div class="text-gray-500">${{ formatAmount(subtotal) }}</div>
              </div>

              <!-- 稅金 -->
              <div class="row justify-between q-mb-md">
                <div class="text-gray-500">Tax(6.00%)</div>
                <div class="text-gray-500">${{ formatAmount(tax) }}</div>
              </div>

              <q-separator class="separator q-mb-md" />

              <!-- 總計 -->
              <div class="row justify-between q-mb-lg">
                <div class="text-weight-bold text-body1">Total</div>
                <div class="text-weight-bold text-body1">${{ formatAmount(total) }}</div>
              </div>

              <!-- 付款按鈕 -->
              <q-btn-group spread class="full-width payment-toggle q-mb-md">
                <q-btn
                  flat
                  :class="{ 'q-btn--active': paymentMethod === 'cash' }"
                  @click="paymentMethod = 'cash'"
                >
                  <div class="payment-btn-content">
                    <q-icon name="payments" size="20px" class="q-mr-sm" />
                    <div class="column items-start">
                      <div class="text-caption">PAY BY CASH</div>
                      <div class="text-weight-medium">${{ formatAmount(total) }}</div>
                    </div>
                  </div>
                </q-btn>
                <q-btn
                  flat
                  :class="{ 'q-btn--active': paymentMethod === 'card' }"
                  @click="paymentMethod = 'card'"
                >
                  <div class="payment-btn-content">
                    <q-icon name="credit_card" size="20px" class="q-mr-sm" />
                    <div class="column items-start">
                      <div class="text-caption">PAY BY CARD</div>
                      <div class="text-weight-medium">${{ formatAmount(total) }}</div>
                    </div>
                  </div>
                </q-btn>
              </q-btn-group>

              <!-- Payment Total -->
              <div class="row justify-between items-center q-mb-lg">
                <div class="text-subtitle1 text-weight-bold">
                  Pay by {{ paymentMethod === 'cash' ? 'Cash' : 'Card' }} Total
                </div>
                <div class="text-h6 text-green-500 text-weight-bold">
                  ${{ formatAmount(total) }}
                </div>
              </div>

              <!-- Location Section -->
              <div class="location-section">
                <div class="row items-center no-wrap q-mb-sm">
                  <q-icon name="location_on" size="16px" class="q-mr-xs" />
                  <span class="text-weight-medium">New York Clinic</span>
                  <q-icon name="expand_more" size="20px" class="q-ml-xs" />
                </div>

                <!-- Log Payment Button -->
                <q-btn
                  unelevated
                  color="orange-500"
                  class="full-width log-payment-btn"
                  padding="sm"
                >
                  <q-icon name="receipt_long" size="20px" class="q-mr-sm" />
                  LOG PAYMENT
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

const description = ref('');
const amount = ref('');
const amountInput = ref<HTMLInputElement | null>(null);
const paymentMethod = ref<'cash' | 'card'>('cash');
const isInputFocused = ref(false);
let cursorPosition = 0;

// 計算屬性
const subtotal = computed(() => parseFloat(amount.value) || 0);
const tax = computed(() => subtotal.value * 0.06);
const total = computed(() => subtotal.value + tax.value);
const displayAmount = computed({
  get: () => {
    if (!amount.value) return '0';
    return isInputFocused.value ? amount.value : formatDisplayAmount(amount.value);
  },
  set: (value: string) => {
    amount.value = value;
  },
});

const formatDisplayAmount = (value: string): string => {
  if (!value) return '0';
  const [integerPart = '0', decimalPart] = value.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

const handleAmountInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  cursorPosition = input.selectionStart || 0;
  let value = input.value.replace(/[^\d.]/g, '');

  // 處理小數點
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  // 處理小數位數
  if (value.includes('.')) {
    const [integerPart, decimalPart] = value.split('.');
    if (decimalPart && decimalPart.length > 2) {
      value = `${integerPart}.${decimalPart.slice(0, 2)}`;
    }
  }

  // 處理前導零
  if (!value.includes('.')) {
    value = value.replace(/^0+/, '') || '0';
  } else if (value.startsWith('0') && value.charAt(1) !== '.') {
    value = value.replace(/^0+/, '');
  }

  amount.value = value;

  // 在下一個 tick 恢復光標位置
  void nextTick(() => {
    if (input.selectionStart !== null) {
      input.selectionStart = cursorPosition;
      input.selectionEnd = cursorPosition;
    }
  });
};

const handleAmountFocus = (event: Event) => {
  isInputFocused.value = true;
  const input = event.target as HTMLInputElement;
  if (amount.value === '0') {
    amount.value = '';
  }
  // 選中所有文字
  input.select();
};

const handleAmountBlur = () => {
  isInputFocused.value = false;
  if (!amount.value) {
    amount.value = '0';
    return;
  }

  // 確保有兩位小數
  if (!amount.value.includes('.')) {
    amount.value = amount.value + '.00';
  } else {
    const parts = amount.value.split('.');
    const decimalPart = parts[1] || '';
    if (decimalPart.length === 0) {
      amount.value = `${parts[0]}.00`;
    } else if (decimalPart.length === 1) {
      amount.value = `${amount.value}0`;
    }
  }
};

const formatAmount = (value: number): string => {
  if (value === 0) return '0';
  return value.toFixed(2);
};

const resetPayment = () => {
  amount.value = '';
  description.value = '';
};
</script>

<style lang="sass">
.container
  max-width: 1200px
  margin: 0 auto
  padding: 0 16px

.main-card
  border-radius: 16px
  border: 1px solid var(--gray-200)
  .q-card__section
    padding: 32px

.payment-input-section
  padding: 48px
  background: white
  border-right: 1px solid var(--gray-200)

.summary-section
  background: white

.summary-content
  padding: 32px

.location-section
  padding: 24px
  background: var(--gray-50)
  border-radius: 0 0 16px 0

.location-btn
  border-radius: 8px
  background: var(--gray-50)
  min-height: 32px
  font-size: var(--font-size-sm)
  color: var(--gray-900)
  text-transform: none

.amount-input
  position: relative
  display: inline-flex
  align-items: center
  justify-content: center
  padding: 16px 24px
  border-radius: 8px
  transition: all 0.2s ease
  min-width: 200px
  text-align: center
  margin: 0 auto
  width: 100%

.currency-symbol
  font-size: 4rem
  margin-right: 0.2em
  font-weight: 400
  line-height: 1
  user-select: none
  color: var(--gray-900)

.amount
  font-size: 4rem
  line-height: 1
  border: none
  background: transparent
  padding: 0
  margin: 0
  outline: none
  width: auto
  min-width: 120px
  text-align: center
  font-weight: 600
  color: var(--gray-900)
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button
    -webkit-appearance: none
    margin: 0

.hidden-input
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  opacity: 0
  cursor: text
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button
    -webkit-appearance: none
    margin: 0

.payment-toggle
  border: 2px solid var(--teal-400)
  border-radius: 8px
  overflow: hidden
  .q-btn
    border-radius: 0
    border: none
    min-height: 64px
    &:first-child
      border-right: 2px solid var(--teal-400)
    &.q-btn--active
      background: var(--teal-50)
    .q-icon
      color: var(--teal-400)

.payment-btn-content
  width: 100%
  display: flex
  align-items: center
  justify-content: flex-start
  padding: 0 8px

.description-input
  background: var(--gray-50)
  .q-field__control
    padding: 12px
    min-height: 120px

.separator
  background: var(--gray-200)
  height: 1px

.log-payment-btn
  border-radius: 8px
  font-weight: 600
  font-size: var(--font-size-sm)

.cursor
  display: inline-block
  width: 2px
  height: 1em
  background-color: var(--gray-900)
  margin-left: 2px
  animation: blink 1s step-end infinite
  vertical-align: baseline

@keyframes blink
  from, to
    opacity: 0
  50%
    opacity: 1
</style>
