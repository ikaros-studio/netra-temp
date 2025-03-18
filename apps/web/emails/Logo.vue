<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    withLabel?: boolean;
  }>(),
  {
    withLabel: true,
  }
);

const colors = {
  primary: "#0500ffff",
};
</script>

<template>
  <span :style="{ color: colors.primary, fontWeight: 600, lineHeight: 1 }">
    <svg
      width="630"
      height="639"
      viewBox="0 0 630 639"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M90 549L238 90"
        stroke="url(#paint0_linear_421_5)"
        stroke-width="179"
        stroke-linecap="round"
      />
      <path
        d="M238 90L392 549"
        stroke="url(#paint1_linear_421_5)"
        stroke-width="179"
        stroke-linecap="round"
      />
      <path
        d="M392 549L540.068 90"
        stroke="url(#paint2_linear_421_5)"
        stroke-width="179"
        stroke-linecap="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_421_5"
          x1="290.169"
          y1="-64.2442"
          x2="87.3519"
          y2="548.119"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stop-color="white" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_421_5"
          x1="441.793"
          y1="704.692"
          x2="240.692"
          y2="89.1247"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stop-color="white" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_421_5"
          x1="615"
          y1="-143.5"
          x2="388.948"
          y2="548"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stop-color="white" />
        </linearGradient>
      </defs>
    </svg>

    <span
      v-if="props.withLabel"
      :style="{
        display: 'inline-block',
        height: '40px',
        lineHeight: '40px',
        marginLeft: '12px',
        fontSize: '18px',
      }"
      >Netra</span
    >
  </span>
</template>
