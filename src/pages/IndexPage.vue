<template>
  <q-page class="q-pt-2xl q-px-2xl col">
    <!-- Title and Location Selection -->
    <div class="row items-center q-mb-lg">
      <div class="text-2xl text-weight-bold q-mr-2xl">Collect Payment</div>
      <q-select
        padding="4px 14px"
        v-model="selectedLocation"
        :options="locationOptions"
        class="location-select-top"
        dense
        standout="bg-teal-100"
      >
        <template v-slot:prepend>
          <i class="fa-solid fa-location-dot q-mr-3xs text-gray-500 text-xs" />
        </template>
        <template v-slot:append>
          <i class="fa-solid fa-chevron-down text-gray-500 text-xs" />
        </template>
      </q-select>
      <q-space />
      <q-btn
        v-show="subtotal > 0"
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
            <div class="text-subtitle1 text-weight-medium text-gray-700 q-mb-md">Enter Amount</div>
            <div class="amount-input">
              <div class="amount-wrapper">
                <input
                  ref="amountInput"
                  type="text"
                  v-model="displayAmount"
                  :size="displayAmount.length || 1"
                  class="amount text-black text-weight-bold"
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
              <div class="text-weight-bold text-body1">${{ formatAmount(onlyWithTax) }}</div>
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
                  <div class="text-xss text-weight-medium q-ml-5xs">
                    ${{ formatAmount(totalByCash) }}
                  </div>
                </div>
              </q-tab>
              <q-tab name="card" class="payment-tab">
                <div class="row items-center">
                  <i class="fa-solid fa-credit-card payment-icon fa-sm"></i>
                  <div class="text-xss text-weight-medium">Pay by Card</div>
                  <div class="text-xss text-weight-medium q-ml-5xs">
                    ${{ formatAmount(totalByCard) }}
                  </div>
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
                  class="text-teal-400 text-weight-medium text-xs q-ml-sm underline-btn"
                  label="Edit"
                  @click="openProcessingFeeDialog"
                />
              </div>
              <div class="text-gray-700 text-weight-medium text-xs">
                ${{ formatAmount(totalPatientFee) }}
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

            <div v-if="warningMessage" class="text-negative text-caption q-mx-md q-mb-md">
              {{ warningMessage }}
            </div>
          </q-card-section>

          <q-separator horizontal />

          <!-- Location Section -->
          <q-card-section class="location-section">
            <div class="row items-center no-wrap q-mb-xs">
              <q-select
                v-model="selectedLocation"
                :options="locationOptions"
                class="location-select-right q-mr-5xs"
                borderless
                dense
              >
                <template v-slot:prepend>
                  <i class="fa-solid fa-location-dot q-mr-3xs text-gray-500 text-xs" />
                </template>
                <template v-slot:append>
                  <i class="fa-solid fa-chevron-down text-gray-500 text-xs" />
                </template>
              </q-select>
            </div>

            <!-- Device Reader Selection - Only show when payment method is card -->
            <template v-if="paymentMethod === 'card'">
              <q-select
                label="Device Reader"
                v-model="selectedReader"
                :options="filteredReaderOptions"
                :option-disable="(opt) => (Object(opt) === opt ? opt.status === 'offline' : true)"
                class="reader-select q-mb-md"
                filled
                dense
                emit-value
                map-options
                borderless
              >
                <template v-slot:option="{ itemProps, opt }">
                  <q-item v-bind="itemProps">
                    <q-item-section side>
                      <i
                        v-if="opt.status === 'online'"
                        class="fa-solid fa-circle-dot text-green-500 text-md"
                      ></i>
                      <i v-else class="fa-solid fa-circle-xmark text-gray-500 text-md"></i>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
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
                @click="openReaderDialog"
                :disable="!isAmountValid"
              >
                <i class="fa-solid fa-tablet q-mr-3xs"></i>
                Initiate Payment on Reader
              </q-btn>

              <q-btn
                unelevated
                class="full-width bg-orange-50 text-orange-500 payment-btn"
                padding="sm"
                @click="openCreditDialog"
                :disable="!isAmountValid"
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
              :disable="!isAmountValid"
            >
              <i class="fa-solid fa-money-bill-wave q-mr-3xs"></i>
              Log Payment
            </q-btn>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>

    <ActionDialog
      v-model="showProcessingFeeDialog"
      title="Edit Merchant Processing Fee"
      subtitle="Only applies to this transaction"
      actionButton="Update"
      show-cancel-button
      @action-click="updateProcessingFee"
    >
      <!-- Fee Value Popup -->
      <div class="slider-container">
        <!-- Slider Section -->
        <div class="q-px-xl">
          <div id="slider-popup-container">
            <!-- NOTE: 20: margin left, 412: slider width, 452: container width -->
            <div class="fee-popup q-pa-3xs" :style="feePopupStyle">
              <div class="fee-value">
                {{
                  activeFee.includes('rate')
                    ? (activeFee === 'merchant-rate'
                        ? editingProcessingFees.merchant.rate
                        : editingProcessingFees.patient.rate
                      ).toFixed(2) + '%'
                    : parseFloat(
                        activeFee === 'merchant-fixed'
                          ? editingProcessingFees.merchant.fixed
                          : editingProcessingFees.patient.fixed,
                      ).toFixed(2)
                }}
              </div>
              <div class="fee-amount">
                ${{
                  formatAmount(
                    activeFee.includes('rate')
                      ? activeFee === 'merchant-rate'
                        ? editingMerchantFeeAmount
                        : editingPatientFeeAmount
                      : parseFloat(
                          String(
                            activeFee === 'merchant-fixed'
                              ? editingMerchantFeeAmount
                              : editingPatientFeeAmount,
                          ),
                        ),
                  )
                }}
              </div>
            </div>
          </div>
          <q-slider
            v-model="editingActiveFeeValue"
            :min="
              activeFee.includes('rate') ? processingFeeRateRange.min : processingFeeFixedRange.min
            "
            :max="
              activeFee.includes('rate') ? processingFeeRateRange.max : processingFeeFixedRange.max
            "
            :step="activeFee.includes('rate') ? 0.1 : 0.01"
            color="teal"
            thumb-color="white"
            :marker-labels="[
              {
                value: activeFee.includes('rate')
                  ? processingFeeRateRange.min
                  : processingFeeFixedRange.min,
                label: activeFee.includes('rate')
                  ? processingFeeRateRange.min.toString()
                  : '$' + processingFeeFixedRange.min,
              },
              {
                value: activeFee.includes('rate')
                  ? processingFeeRateRange.max
                  : processingFeeFixedRange.max,
                label: activeFee.includes('rate')
                  ? processingFeeRateRange.max.toString() + '%'
                  : '$' + processingFeeFixedRange.max.toFixed(2),
              },
            ]"
            class="shadowed-thumb-slider"
          />
        </div>
      </div>

      <q-separator horizontal color="gray-50" class="q-my-md" />

      <!-- Fee Details -->
      <div class="fee-details q-py-xl">
        <div class="row items-center q-mb-md">
          <div class="text-weight-medium text-sm q-mr-3xs">Merchant processing fee</div>
          <q-input
            :model-value="formatRate(editingProcessingFees.merchant.rate)"
            type="text"
            dense
            borderless
            class="rate-input"
            @focus="activeFee = 'merchant-rate'"
            @update:model-value="(val) => handleRateInput(String(val || ''), 'merchant')"
          />
          <div class="text-gray-700 text-xss q-ml-3xs">/ {{ processingFeeRateRange.max }}%</div>
          <i class="fa-solid fa-plus text-gray-700 q-mx-5xs" style="opacity: 0.4"></i>
          <q-input
            :model-value="editingProcessingFees.merchant.fixed"
            type="text"
            dense
            borderless
            class="fixed-fee-input"
            @focus="activeFee = 'merchant-fixed'"
            @update:model-value="(val) => handleFixedFeeInput(String(val || ''), 'merchant')"
          />
          <div class="text-gray-700 text-xss q-ml-3xs">
            / ${{ processingFeeFixedRange.max.toFixed(2) }}
          </div>
        </div>
        <div class="row items-center">
          <div class="text-weight-medium text-sm q-mr-3xs">Patient processing fee</div>
          <q-input
            :model-value="formatRate(editingProcessingFees.patient.rate)"
            type="text"
            dense
            borderless
            class="rate-input"
            @focus="activeFee = 'patient-rate'"
            @update:model-value="(val) => handleRateInput(String(val || ''), 'patient')"
          />
          <div class="text-gray-700 text-xss q-ml-3xs">/ {{ processingFeeRateRange.max }}%</div>
          <i class="fa-solid fa-plus text-gray-700 q-mx-5xs" style="opacity: 0.4"></i>

          <q-input
            :model-value="editingProcessingFees.patient.fixed"
            type="text"
            dense
            borderless
            class="fixed-fee-input"
            @focus="activeFee = 'patient-fixed'"
            @update:model-value="(val) => handleFixedFeeInput(String(val || ''), 'patient')"
          />
          <div class="text-gray-700 text-xss q-ml-3xs">
            / ${{ processingFeeFixedRange.max.toFixed(2) }}
          </div>
        </div>
      </div>

      <!-- Reset Patient Fee Link -->
      <div class="text-center q-mb-xl">
        <q-btn
          flat
          dense
          padding="none"
          class="text-teal-400 underline-btn"
          label="Set patient processing fee to 0"
          @click="resetPatientFee"
        />
      </div>

      <!-- Transaction Summary -->
      <div class="text-weight-bold text-black text-sm q-pb-2xl text-center">
        On this ${{ formatAmount(subtotal) }} transaction, you pay ${{
          formatAmount(editingTotalMerchantFee)
        }}, and patient pays ${{ formatAmount(editingTotalPatientFee) }}
      </div>
    </ActionDialog>

    <ActionDialog
      v-model="showReaderDialog"
      no-header
      actionButton="Process Payment"
      show-cancel-button
      show-separator
    >
      <template #content>
        <div
          class="reader-dialog text-center"
          :style="{
            padding: '40px 0',
            maxWidth: '452px',
            margin: '0 auto',
          }"
        >
          <img :src="cardReaderImage" style="width: 120px; height: 120px" class="q-mb-xl" />

          <div class="row items-center justify-center q-pb-3xs">
            <i class="fa-solid fa-eye q-mr-3xs"></i>
            <div class="text-md text-weight-bold text-black">Review Details with Patient</div>
          </div>
          <div class="text-sm text-weight-regular text-gray-700 q-mb-2xl">
            Review details of this transaction with the customer on the device reader. If everything
            looks good, proceed to process payment.
          </div>

          <div
            class="bg-teal-50 text-teal-700 row items-center justify-center text-weight-medium q-mb-5xs"
            :style="{ height: '41px', borderRadius: '4px' }"
          >
            Auto-Processing in
            <span class="text-weight-bold q-ml-4xs">{{ processingCountdown }}s</span>
          </div>

          <div class="text-gray-700" style="font-size: 9px">Or click "Process Payment" below</div>
        </div>
      </template>
    </ActionDialog>

    <ActionDialog
      v-model="showCreditDialog"
      title="Credit Card Details"
      :actionButton="`Pay $${formatAmount(total)}`"
      show-cancel-button
      show-separator
    >
      <template #content>
        <div class="credit-card-dialog q-py-2xl">
          <!-- Name on Card -->
          <q-input
            v-model="creditCard.name"
            label="Name on Card"
            class="q-mb-3xs"
            filled
            label-color="gray-600"
          />

          <!-- Card Number -->
          <q-input v-model="creditCard.number" label="Card Number" class="q-mb-3xs" filled />

          <div class="row q-mb-3xs">
            <!-- Expiration Date -->
            <div class="col">
              <q-input v-model="creditCard.expiry" label="Expiration Date" filled />
            </div>
            <q-space style="width: 12px" />
            <!-- CVC -->
            <div class="col">
              <q-input v-model="creditCard.cvc" label="CVC" filled />
            </div>
          </div>

          <div class="row">
            <!-- Country -->
            <div class="col">
              <q-select
                v-model="creditCard.country"
                :options="['United States']"
                label="Country"
                filled
              />
            </div>

            <q-space style="width: 12px" />
            <!-- ZIP -->
            <div class="col">
              <q-input v-model="creditCard.zip" label="ZIP" filled />
            </div>
          </div>
        </div>
      </template>
    </ActionDialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import type { ProcessingFees, Location, Reader, LocationOption, ReaderOption } from 'src/types';
import { deepCopy } from 'src/lib/utils';
import ActionDialog from 'src/components/ActionDialog.vue';
import cardReaderImage from 'src/assets/images/card-reader.svg';
import {
  DEFAULT_TAX_RATE,
  DEFAULT_PROCESSING_FEE,
  LOCATIONS,
  READERS,
  ORGANIZATION,
} from 'src/constants';

const description = ref('');
const amount = ref('');
const amountInput = ref<HTMLInputElement | null>(null);
const paymentMethod = ref<'cash' | 'card'>('cash');
const isInputFocused = ref(false);
const taxRate = computed(() => {
  if (selectedLocation.value) {
    return parseFloat(selectedLocation.value.taxRate);
  }
  return DEFAULT_TAX_RATE;
});
let cursorPosition = 0;

// NOTE: Only one organization for now
const organization = ORGANIZATION;
const locations = LOCATIONS;
const locationOptions: LocationOption[] = locations.map((location) => ({
  ...location,
  label: location.name,
  value: location.id,
}));
const selectedLocation = ref<Location | null>(locationOptions[0] || null);

const readers = READERS;
const readerOptions: ReaderOption[] = readers.map((reader) => ({
  ...reader,
  value: reader.id,
}));
const filteredReaderOptions = computed(() =>
  readerOptions.filter((reader) => reader.locationId === selectedLocation.value?.id),
);
const selectedReader = ref<Reader | null>(filteredReaderOptions.value[0] || null);

// Dialog related variables
const showProcessingFeeDialog = ref(false);
const showCreditDialog = ref(false);
const showReaderDialog = ref(false);
const processingFeeRateRange = ref({
  min: 0,
  // NOTE: Round to 3 decimal places, cause rate in organization is 5 decimal places
  max: parseFloat((parseFloat(organization.totalProcessingFeePercentage) * 100).toFixed(3)),
});
const processingFeeFixedRange = ref({
  min: 0,
  max: organization.totalProcessingFeeFixed / 100,
});
const activeFee = ref<'merchant-rate' | 'patient-rate' | 'merchant-fixed' | 'patient-fixed'>(
  'merchant-rate',
);

const processingFees = ref<ProcessingFees>({ ...DEFAULT_PROCESSING_FEE });
const editingProcessingFees = ref<ProcessingFees>({ ...DEFAULT_PROCESSING_FEE });

// Initialize fees from localStorage or use defaults
const initializeFees = (): void => {
  try {
    const storedFees = localStorage.getItem('processingFees');
    if (storedFees) {
      const fees = JSON.parse(storedFees) as ProcessingFees;
      processingFees.value = deepCopy(fees);
      editingProcessingFees.value = deepCopy(fees);
    }
  } catch (error) {
    console.error('Error initializing fees:', error);
  }
};

// Initialize on component mount
initializeFees();

// Update the fee popup style calculation
const feePopupStyle = computed(() => {
  const value = activeFee.value.includes('rate')
    ? activeFee.value === 'merchant-rate'
      ? editingProcessingFees.value.merchant.rate
      : editingProcessingFees.value.patient.rate
    : parseFloat(
        activeFee.value === 'merchant-fixed'
          ? editingProcessingFees.value.merchant.fixed
          : editingProcessingFees.value.patient.fixed,
      );

  const max = activeFee.value.includes('rate')
    ? processingFeeRateRange.value.max
    : processingFeeFixedRange.value.max;

  return {
    left: `calc(${value * (100 / max) * (412 / 452) + (20 * 100) / 452}%)`,
  };
});

// Update the editingActiveFeeValue computed property
const editingActiveFeeValue = computed({
  get: () => {
    if (activeFee.value === 'merchant-rate') {
      return editingProcessingFees.value.merchant.rate;
    } else if (activeFee.value === 'patient-rate') {
      return editingProcessingFees.value.patient.rate;
    } else if (activeFee.value === 'merchant-fixed') {
      return parseFloat(editingProcessingFees.value.merchant.fixed || '0');
    } else {
      return parseFloat(editingProcessingFees.value.patient.fixed || '0');
    }
  },
  set: (value: number) => {
    const totalRate = processingFeeRateRange.value.max;
    const totalFixed = processingFeeFixedRange.value.max;
    const clampedValue = Math.min(
      Math.max(value, 0),
      activeFee.value.includes('rate') ? totalRate : totalFixed,
    );

    if (activeFee.value === 'merchant-rate') {
      editingProcessingFees.value.merchant.rate = parseFloat(clampedValue.toFixed(3));
      editingProcessingFees.value.patient.rate = parseFloat((totalRate - clampedValue).toFixed(3));
    } else if (activeFee.value === 'patient-rate') {
      editingProcessingFees.value.patient.rate = parseFloat(clampedValue.toFixed(3));
      editingProcessingFees.value.merchant.rate = parseFloat((totalRate - clampedValue).toFixed(3));
    } else if (activeFee.value === 'merchant-fixed') {
      editingProcessingFees.value.merchant.fixed = clampedValue.toFixed(2);
      editingProcessingFees.value.patient.fixed = (totalFixed - clampedValue).toFixed(2);
    } else {
      editingProcessingFees.value.patient.fixed = clampedValue.toFixed(2);
      editingProcessingFees.value.merchant.fixed = (totalFixed - clampedValue).toFixed(2);
    }
  },
});

// Fee amount calculations
const editingMerchantFeeAmount = computed(() => {
  return (subtotal.value * editingProcessingFees.value.merchant.rate) / 100;
});

const editingPatientFeeAmount = computed(() => {
  return (subtotal.value * editingProcessingFees.value.patient.rate) / 100;
});

const editingTotalMerchantFee = computed(() => {
  return (
    editingMerchantFeeAmount.value + parseFloat(editingProcessingFees.value.merchant.fixed || '0')
  );
});

const editingTotalPatientFee = computed(() => {
  return (
    editingPatientFeeAmount.value + parseFloat(editingProcessingFees.value.patient.fixed || '0')
  );
});

// Reset patient fee and update localStorage
const resetPatientFee = (): void => {
  editingProcessingFees.value.patient.rate = 0;
  editingProcessingFees.value.patient.fixed = '0.00';
  // Update merchant fees to take the full amount
  editingProcessingFees.value.merchant.rate = processingFeeRateRange.value.max;
  editingProcessingFees.value.merchant.fixed = processingFeeFixedRange.value.max.toFixed(2);
};

// Update processing fee and localStorage
const updateProcessingFee = (): void => {
  processingFees.value = deepCopy(editingProcessingFees.value);
  const feesToStore: ProcessingFees = {
    merchant: {
      rate: editingProcessingFees.value.merchant.rate,
      fixed: editingProcessingFees.value.merchant.fixed,
    },
    patient: {
      rate: editingProcessingFees.value.patient.rate,
      fixed: editingProcessingFees.value.patient.fixed,
    },
  };

  try {
    localStorage.setItem('processingFees', JSON.stringify(feesToStore));
  } catch (error) {
    console.error('Error saving fees:', error);
  }
};

// Handle rate input changes
const handleRateInput = (value: string, type: 'merchant' | 'patient'): void => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    const totalRate = processingFeeRateRange.value.max;
    const clampedValue = Math.min(Math.max(numValue, 0), totalRate);

    if (type === 'merchant') {
      editingProcessingFees.value.merchant.rate = parseFloat(clampedValue.toFixed(2));
      editingProcessingFees.value.patient.rate = parseFloat((totalRate - clampedValue).toFixed(2));
    } else {
      editingProcessingFees.value.patient.rate = parseFloat(clampedValue.toFixed(2));
      editingProcessingFees.value.merchant.rate = parseFloat((totalRate - clampedValue).toFixed(2));
    }
  }
};

// Handle fixed fee input changes
const handleFixedFeeInput = (value: string, type: 'merchant' | 'patient'): void => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    const totalFixed = processingFeeFixedRange.value.max;
    const clampedValue = Math.min(Math.max(numValue, 0), totalFixed);

    if (type === 'merchant') {
      editingProcessingFees.value.merchant.fixed = clampedValue.toFixed(2);
      editingProcessingFees.value.patient.fixed = (totalFixed - clampedValue).toFixed(2);
    } else {
      editingProcessingFees.value.patient.fixed = clampedValue.toFixed(2);
      editingProcessingFees.value.merchant.fixed = (totalFixed - clampedValue).toFixed(2);
    }
  }
};

// Computed Properties
const subtotal = computed(() => parseFloat(amount.value) || 0);
const tax = computed(() => {
  const rawTax = subtotal.value * taxRate.value;
  // Round up to 2 decimal places
  return Math.ceil(rawTax * 100) / 100;
});

const total = computed(() => {
  if (paymentMethod.value === 'cash') {
    return totalByCash.value;
  } else {
    return totalByCard.value;
  }
});

const onlyWithTax = computed(() => subtotal.value + tax.value);

const totalByCash = computed(() => subtotal.value + tax.value);

const totalByCard = computed(() => subtotal.value + tax.value + totalPatientFee.value);

const displayAmount = computed({
  get: () => {
    if (!amount.value) return '0';
    return isInputFocused.value ? amount.value : formatDisplayAmount(amount.value);
  },
  set: (value: string) => {
    amount.value = value;
  },
});

const patientFeeAmount = computed(() => {
  return (subtotal.value * processingFees.value.patient.rate) / 100;
});

const totalPatientFee = computed(() => {
  return patientFeeAmount.value + parseFloat(processingFees.value.patient.fixed || '0');
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
  // Round up to 2 decimal places using Math.ceil
  return (Math.ceil(value * 100) / 100).toFixed(2);
};

const resetPayment = () => {
  amount.value = '';
  description.value = '';
};

// Open edit dialog
const openProcessingFeeDialog = () => {
  editingProcessingFees.value = deepCopy(processingFees.value);
  showProcessingFeeDialog.value = true;
};

const openCreditDialog = () => {
  showCreditDialog.value = true;
};

const openReaderDialog = () => {
  showReaderDialog.value = true;
  startProcessingCountdown();
};

// Format rate for display
const formatRate = (value: number): string => {
  return value.toFixed(2);
};

// Add to script section after other refs
const creditCard = ref({
  name: '',
  number: '',
  expiry: '',
  cvc: '',
  country: 'United States',
  zip: '',
});

// Add after other refs
const processingCountdown = ref(5);

// Add after other functions
const startProcessingCountdown = () => {
  processingCountdown.value = 5;
  const timer = setInterval(() => {
    processingCountdown.value--;
    if (processingCountdown.value <= 0) {
      clearInterval(timer);
      showReaderDialog.value = false;
      // TODO: Handle payment processing
    }
  }, 1000);
};

// Add minimum amount constant
const MINIMUM_AMOUNT = 0.5;

// Add computed property for amount validation
const isAmountValid = computed(() => total.value >= MINIMUM_AMOUNT);

// Add warning message computed
const warningMessage = computed(() =>
  !isAmountValid.value && subtotal.value !== 0
    ? `*Total amount falls below the required minimum of $${MINIMUM_AMOUNT.toFixed(2)}`
    : '',
);
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

.location-select-top
  border-radius: 8px
  min-height: 40px
  height: 40px
  background: var(--gray-100)
  .q-field__native
    color: black
    font-weight: 500
  .q-field__inner
    .q-field__control
      border-radius: 8px
  &.q-field--focused
    .q-field__inner
      .q-field__control
        background: var(--teal-300)

.location-select-right
  border-radius: 8px
  min-height: 40px
  height: 40px
  .q-field__inner
    .q-field__control
      border-radius: 8px
  &.q-field--focused
    .q-field__inner
      .q-field__control
        background: transparent


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

.underline-btn
  .q-btn__content
    text-decoration: underline
  .q-focus-helper
    display: none

.reader-select
  &.q-field--highlighted .q-field__append
    transform: rotate(180deg)
    transition: transform 0.3s ease
  .q-field__inner
    .q-field__control
      height: 56px
      min-height: 56px
      border-radius: 8px 8px 0 0
      .q-field__control-container .q-field__native
        font-weight: 500
        font-size: 15px
        color: black
  .q-field__append
    height: 100%
    padding: 0
    display: flex
    align-items: center
    justify-content: center

.q-select
  .q-select__dropdown-icon
    display: none

.payment-btn
  border-radius: 6px

// Dialog Custom Styles
.slider-container
  position: relative
  padding-top: 60px

.fee-popup
  position: absolute
  transform: translateX(-50%)
  background: white
  border-radius: 12px
  padding: 8px
  box-shadow: 0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)
  top: 12px
  z-index: 1
  &:after
    content: ''
    position: absolute
    bottom: -4px
    left: 50%
    transform: translateX(-50%) rotate(45deg)
    width: 8px
    height: 8px
    background: white
    box-shadow: 4px 4px 8px -4px rgba(16, 24, 40, 0.08)

.fee-value
  font-size: 14px
  line-height: 100%
  font-weight: 500
  color: var(--gray-900)
  text-align: center
  margin-bottom: 2px

.fee-amount
  font-size: 10px
  line-height: 100%
  font-weight: 400
  color: var(--gray-700)
  text-align: center

.fee-rate
  background: var(--teal-50)
  color: var(--teal-700)
  padding: 2px 6px
  border-radius: 4px
  font-size: 14px
  font-weight: 500

.fee-details
  .row.items-center.q-mb-md
    .text-subtitle1
      color: var(--gray-700)
      font-size: 14px
      margin-right: 12px
      &.divider
        margin: 0 12px

.rate-input
  width: 87px
  position: relative
  display: flex
  align-items: center
  .q-field__native
    padding-left: 10px
    text-align: left
    color: black
    font-weight: 700
    font-size: 16px
    border-radius: 4px
    background: var(--gray-50)
  &::after
    content: '%'
    color: var(--gray-700)
    font-weight: 500
    font-size: 15px
    margin-left: -24px
    z-index: 0

.fixed-fee-input
  width: 82px
  position: relative
  .q-field__native
    padding-right: 10px
    text-align: right
    color: black
    font-weight: 700
    font-size: 14px
    border-radius: 4px
    background: var(--gray-50)
  &:before
    content: '$'
    position: absolute
    left: 10px
    top: 50%
    transform: translateY(-50%)
    z-index: 1
    color: var(--gray-700)
    font-size: 14px
    font-weight: 500

.text-gray-400
  font-size: 14px
  color: var(--gray-400)

.shadowed-thumb-slider
  .q-slider__thumb
    filter: drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.3));

.credit-card-dialog
  .q-field__label
    font-size: 15px
    font-weight: 500
    color: var(--gray-600)
  .q-field__native
    font-size: 15px
    font-weight: 500
    color: black

.q-menu
  border-radius: 6px
  border: 1px solid var(--gray-100)
  padding: 8px
  .q-item
    border-radius: 6px
  .q-item__section--side
    padding-right: 12px
  .q-item .q-item__label
    font-size: 14px
    font-weight: 500
    color: var(--gray-800)
  .q-item.disabled .q-item__label
    color: var(--gray-400)
  .q-virtual-scroll__content > .q-item.q-manual-focusable--focused > .q-focus-helper
    background: var(--gray-50)
    opacity: 1
    z-index: -1
</style>
