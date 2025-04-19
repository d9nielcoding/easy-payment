<template>
  <q-page class="q-py-2xl q-px-2xl col">
    <!-- Title and Location Selection -->
    <div class="row items-center q-mb-lg">
      <div class="text-2xl text-weight-bold q-mr-2xl">Collect Payment</div>
      <q-btn flat class="location-btn" padding="4px 14px">
        <i class="fa-solid fa-location-dot q-mr-3xs text-gray-500 text-xs" />
        <span class="text-weight-medium text-sm q-mr-5xs">New York Clinic</span>
        <i class="fa-solid fa-chevron-down text-gray-500 text-xs" />
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

    <!-- Main Content Area -->
    <q-card flat bordered class="main-card row">
      <q-card-section horizontal class="col">
        <!-- Left Section -->
        <q-card-section class="col-12 col-md-9 payment-input-section">
          <!-- Amount Input -->
          <div class="text-center q-mb-xl">
            <div class="text-subtitle1 text-weight-medium text-gray-600 q-mb-md">Enter Amount</div>
            <div class="amount-input">
              <div class="amount-wrapper">
                <input
                  ref="amountInput"
                  type="text"
                  v-model="displayAmount"
                  :size="displayAmount.length || 1"
                  class="amount text-gray-900 text-weight-bold"
                  inputmode="decimal"
                  @input="handleAmountInput"
                  @focus="handleAmountFocus"
                  @blur="handleAmountBlur"
                />
              </div>
            </div>
          </div>

          <!-- Description Input -->
          <div class="row justify-center">
            <textarea
              v-model="description"
              placeholder="Description (Optional)"
              class="description-input"
            ></textarea>
          </div>
        </q-card-section>

        <!-- Right Section -->
        <q-card-section vertical class="col-12 col-md-3 summary-section">
          <q-card-section class="summary-header">
            <div class="text-md text-weight-bold">Summary</div>
          </q-card-section>

          <q-separator horizontal />

          <q-card-section class="summary-content">
            <!-- Subtotal -->
            <div class="row justify-between items-center q-px-md h-4xl">
              <div class="text-gray-700 text-weight-medium text-xs">Subtotal</div>
              <div class="text-gray-700 text-weight-medium text-xs">
                ${{ formatAmount(subtotal) }}
              </div>
            </div>

            <!-- Tax -->
            <div class="row justify-between items-center q-px-md h-4xl">
              <div class="text-gray-700 text-weight-medium text-xs">Tax(6.00%)</div>
              <div class="text-gray-700 text-weight-medium text-xs">${{ formatAmount(tax) }}</div>
            </div>

            <q-separator color="teal-700" />

            <!-- Total -->
            <div class="row justify-between items-center q-px-md q-py-lg">
              <div class="text-weight-bold text-body1">Total</div>
              <div class="text-weight-bold text-body1">${{ formatAmount(total) }}</div>
            </div>

            <!-- Payment Buttons -->
            <q-tabs
              v-model="paymentMethod"
              class="payment-toggle q-mb-2xl"
              no-caps
              indicator-color="transparent"
            >
              <q-tab name="cash" class="payment-tab">
                <div class="row items-center">
                  <i class="fa-solid fa-sack-dollar payment-icon fa-sm"></i>
                  <div class="text-xss text-weight-medium">Pay by Cash</div>
                  <div class="text-xss text-weight-medium q-ml-5xs">${{ formatAmount(total) }}</div>
                </div>
              </q-tab>
              <q-tab name="card" class="payment-tab">
                <div class="row items-center">
                  <i class="fa-solid fa-credit-card payment-icon fa-sm"></i>
                  <div class="text-xss text-weight-medium">Pay by Card</div>
                  <div class="text-xss text-weight-medium q-ml-5xs">${{ formatAmount(total) }}</div>
                </div>
              </q-tab>
            </q-tabs>

            <div
              v-show="paymentMethod === 'card'"
              class="row justify-between items-center q-px-md q-mb-2xl"
            >
              <div class="row items-center">
                <div class="text-gray-700 text-weight-medium text-xs">
                  Patient Card Processing Fee
                </div>
                <q-btn
                  flat
                  dense
                  padding="none"
                  class="text-teal-400 text-weight-medium text-xs q-ml-sm edit-btn"
                  label="Edit"
                />
              </div>
              <div class="text-gray-700 text-weight-medium text-xs">
                ${{ formatAmount(cardProcessingFee) }}
              </div>
            </div>

            <q-separator color="teal-700" />

            <!-- Payment Total -->
            <div class="row justify-between items-center q-mt-3xl q-mb-2xl q-mx-md">
              <div class="text-xs text-weight-bold">
                Pay by {{ paymentMethod === 'cash' ? 'Cash' : 'Card' }} Total
              </div>
              <div class="text-xl text-green-500 text-weight-bold">${{ formatAmount(total) }}</div>
            </div>
          </q-card-section>

          <q-separator horizontal />

          <!-- Location Section -->
          <q-card-section class="location-section">
            <div class="row items-center no-wrap q-mb-sm">
              <i class="fa-solid fa-location-dot q-mr-3xs text-gray-500 text-xs" />
              <span class="text-weight-medium text-sm q-mr-5xs">New York Clinic</span>
              <i class="fa-solid fa-chevron-down text-gray-500 text-xs" />
            </div>

            <!-- Device Reader Selection - Only show when payment method is card -->
            <template v-if="paymentMethod === 'card'">
              <div class="text-xs text-gray-500 q-mb-2xs">Device Reader</div>
              <q-select
                v-model="selectedReader"
                :options="readerOptions"
                class="reader-select q-mb-md"
                filled
                dense
                emit-value
                map-options
                borderless
              >
                <template v-slot:append>
                  <i class="fa-solid fa-chevron-down text-gray-500 text-xs"></i>
                </template>
              </q-select>

              <!-- Payment Buttons -->
              <q-btn
                unelevated
                color="orange-500"
                class="full-width q-mb-sm payment-btn"
                padding="sm"
              >
                <i class="fa-solid fa-credit-card q-mr-3xs"></i>
                Initiate Payment on Reader
              </q-btn>

              <q-btn
                unelevated
                class="full-width bg-orange-50 text-orange-500 payment-btn"
                padding="sm"
              >
                <i class="fa-solid fa-keyboard q-mr-3xs"></i>
                Input Card Number Manually
              </q-btn>
            </template>

            <!-- Log Payment Button - Only show when payment method is cash -->
            <q-btn
              v-else
              unelevated
              color="orange-500"
              class="full-width log-payment-btn"
              padding="sm"
            >
              <i class="fa-solid fa-money-bill-wave q-mr-3xs"></i>
              Log Payment
            </q-btn>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

const description = ref('');
const amount = ref('');
const amountInput = ref<HTMLInputElement | null>(null);
const paymentMethod = ref<'cash' | 'card'>('cash');
const isInputFocused = ref(false);
const processingFee = ref(0);
let cursorPosition = 0;

// Device reader options
const selectedReader = ref('reader01');
const readerOptions = [
  { label: 'Device Reader 01', value: 'reader01' },
  { label: 'Device Reader 02', value: 'reader02' },
  { label: 'Device Reader 03', value: 'reader03' },
];

// Computed Properties
const subtotal = computed(() => parseFloat(amount.value) || 0);
const tax = computed(() => {
  const rawTax = subtotal.value * 0.06;
  // Round up to 2 decimal places
  return Math.ceil(rawTax * 100) / 100;
});
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

const cardProcessingFee = computed(() => processingFee.value);

const formatDisplayAmount = (value: string): string => {
  if (!value) return '0';
  const [integerPart = '0', decimalPart] = value.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

const handleAmountInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  cursorPosition = input.selectionStart || 0;
  let value = input.value.replace(/[^\d.$]/g, '');

  // Ensure single $ at the beginning
  if (value.includes('$')) {
    value = '$' + value.replace(/\$/g, '');
  } else {
    value = '$' + value;
  }

  // Handle decimal point
  const parts = value.slice(1).split('.');
  if (parts.length > 2) {
    value = '$' + parts[0] + '.' + parts.slice(1).join('');
  }

  // Handle decimal places
  if (value.includes('.')) {
    const [integerPart, decimalPart] = value.slice(1).split('.');
    if (decimalPart && decimalPart.length > 2) {
      value = '$' + integerPart + '.' + decimalPart.slice(0, 2);
    }
  }

  // Handle leading zeros
  const numberPart = value.slice(1);
  if (!numberPart.includes('.')) {
    value = '$' + (numberPart.replace(/^0+/, '') || '0');
  } else if (numberPart.startsWith('0') && numberPart.charAt(1) !== '.') {
    value = '$' + numberPart.replace(/^0+/, '');
  }

  amount.value = value.slice(1); // Remove currency symbol before saving

  // Restore cursor position in next tick
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
  // Select all text
  input.select();
};

const handleAmountBlur = () => {
  isInputFocused.value = false;
  if (!amount.value || parseFloat(amount.value) === 0) {
    amount.value = '0';
    return;
  }

  // Ensure two decimal places
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
.q-page
  height: 100%
  display: flex
  flex-direction: column

.main-card
  border-radius: 16px
  border: 1px solid var(--gray-200)
  overflow: hidden
  flex: 1

.payment-input-section
  padding: 48px
  background: white
  border-right: 1px solid var(--gray-200)

.summary-section
  background: white
  padding: 0

.summary-header
  height: 72px
  display: flex
  align-items: center
  padding: 0 24px

.summary-content
  padding: 16px

.location-section
  padding: 16px

.location-btn
  border-radius: 8px
  background: var(--gray-100)
  min-height: 37px
  height: 37px

.amount-input
  text-align: center

.amount-wrapper
  position: relative
  display: inline-block

.amount
  font-size: 4rem
  line-height: 1
  border: none
  background: transparent
  padding: 0
  margin: 0
  outline: none
  text-align: center
  font-weight: 600
  color: var(--gray-900)
  box-sizing: content-box
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button
    -webkit-appearance: none
    margin: 0

.amount-wrapper::before
  content: '$'
  position: absolute
  font-size: 2rem
  left: -0.4em
  top: 0.2rem
  color: var(--gray-900)
  font-weight: 400

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
  border: 1px solid var(--teal-100)
  border-radius: 8px
  overflow: hidden
  background: white
  .q-tabs__content
    margin: -1px
    .q-tab
      min-height: 32px
      height: 32px
      padding: 0 8px
      border-radius: 0
      color: var(--teal-700)
      text-transform: none
      &:first-child
        border-right: 1px solid var(--teal-100)
      &:hover:not(.q-tab--active)
        background: var(--teal-50)
      &.q-tab--active
        background: var(--teal-100)
        box-shadow: none

.description-input
  width: 400px
  min-height: 100px
  padding: 12px 16px
  border: none
  border-radius: 8px 8px 0 0
  background: var(--gray-50)
  resize: none
  font-size: var(--font-size-sm)
  color: var(--gray-900)
  &::placeholder
    color: var(--gray-500)
    font-weight: 500
    font-size: 15px
  &:focus
    outline: none

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

.h-4xl
  height: 36px

.payment-icon
  margin-right: 8px

.edit-btn
  .q-btn__content
    text-decoration: underline

.reader-select
  :deep(.q-field__control)
    background: var(--gray-50)
    min-height: 40px
    border-radius: 8px
  :deep(.q-field__native)
    padding: 0
    color: var(--gray-900)
    font-size: var(--font-size-sm)
    font-weight: 500

.payment-btn
  border-radius: 6px
</style>
