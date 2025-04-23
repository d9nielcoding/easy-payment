<template>
  <q-dialog :model-value="modelValue" @update:model-value="onUpdateModelValue" persistent>
    <q-card
      :style="{
        minWidth: '500px',
        borderRadius: '8px',
      }"
    >
      <slot name="header" v-if="!noHeader">
        <q-card-section vertical class="q-pt-2xl q-px-2xl q-pb-none">
          <div class="row items-center">
            <div class="text-2xl text-weight-bold">{{ title }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup class="text-gray-300" />
          </div>
          <div v-if="subtitle" class="text-xs text-gray-700 q-mt-xs">{{ subtitle }}</div>
        </q-card-section>
      </slot>

      <q-card-section class="q-px-2xl q-py-none">
        <slot name="content">
          <slot />
        </slot>
      </q-card-section>

      <q-separator v-if="showSeparator" />

      <slot name="footer" v-if="!noFooter">
        <q-card-actions align="right" class="q-pt-xs q-pb-none q-pb-xs q-px-2xl">
          <q-btn
            v-if="showCancelButton"
            flat
            no-caps
            class="cancel-btn"
            label="Cancel"
            v-close-popup
          />
          <q-space />
          <q-btn
            v-if="actionButton"
            unelevated
            no-caps
            class="bg-orange-400 text-white"
            :style="{ padding: '8px 16px', borderRadius: '6px' }"
            :label="actionButton"
            v-close-popup
            @click="onActionClick"
          />
        </q-card-actions>
      </slot>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title: string;
  subtitle?: string;
  actionButton?: string;
  onActionClick?: () => void;
  showCancelButton?: boolean;
  showSeparator?: boolean;
  noHeader?: boolean;
  noFooter?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const onUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};
</script>

<style lang="sass">
// Dialog Custom Styles
.slider-container
  position: relative
  padding-top: 85px

.fee-popup
  position: absolute
  transform: translateX(-50%)
  background: white
  border-radius: 12px
  padding: 8px
  box-shadow: 0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)
  top: 0
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
  font-size: 20px
  line-height: 28px
  font-weight: 600
  color: var(--gray-900)
  text-align: center
  margin-bottom: 2px

.fee-amount
  font-size: 14px
  line-height: 20px
  color: var(--gray-600)
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
    filter: drop-shadow(4px 4px 6px rgba(0, 0, 0, 0.3))

.cancel-btn
  font-size: 14px
  font-weight: 600
  color: var(--gray-600)

.action-row-border-t
  border-top: 1px solid var(--gray-100)
</style>
