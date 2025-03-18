<script setup lang="ts">
import {
  ChevronRightIcon,
  GridIcon,
  SettingsIcon,
  UserCogIcon,
  Building2Icon,
  BellIcon,
  PlusIcon
} from "lucide-vue-next";
import { AddEntityModal } from "~/modules/saas/dashboard/components";

const route = useRoute();
const { t } = useTranslations();
const { user } = useUser();

const isAdmin = computed(() => user.value?.role === "ADMIN");

type MenuItem = {
  label: string;
  to: string;
  icon: Component;
  soon?: boolean;
};

const menuItems = computed<MenuItem[]>(() => {
  return [
    {
      label: t("dashboard.menu.dashboard"),
      icon: GridIcon,
      to: "/app/dashboard",
    },
    {
      label: t("dashboard.menu.entities"),
      icon: Building2Icon,
      to: "/app/entities",
    },
    {
      label: t("dashboard.menu.alerts"),
      icon: BellIcon,
      to: "/app/alerts",
      soon: true,
    },
    {
      label: t("dashboard.menu.settings"),
      icon: SettingsIcon,
      to: "/app/settings",
    },
    ...(isAdmin.value
      ? ([
          {
            label: t("dashboard.menu.admin"),
            icon: UserCogIcon,
            to: "/app/admin",
          },
        ] satisfies MenuItem[])
      : []),
  ];
});

const isActiveMenuItem = (href: string | null) => {
  return href && route.path.includes(href);
};

// Add state for modal
const showAddEntityModal = ref(false);
</script>

<template>
  <nav class="w-full border-b">
    <div class="container max-w-6xl py-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <NuxtLinkLocale to="/" class="block w-full">
            <Logo />
          </NuxtLinkLocale>

          <span class="hidden opacity-30 md:block">
            <ChevronRightIcon class="size-4" />
          </span>

          <SaasTeamSelect />
        </div>

        <div class="ml-auto mr-0 flex items-center justify-end gap-4">
          <!-- Add Entity Button -->
          <Button variant="outline" size="sm" @click="showAddEntityModal = true" class="gap-1">
            <PlusIcon class="size-4" />
            <span>Add Entity</span>
          </Button>
          
          <UserMenu />
        </div>
      </div>

      <ul
        class="no-scrollbar -mx-8 -mb-4 mt-6 flex list-none items-center justify-start gap-6 overflow-x-auto px-8 text-sm lg:text-base"
      >
        <li v-for="menuItem of menuItems" :key="menuItem.to">
          <NuxtLinkLocale
            v-if="!menuItem.soon"
            :to="menuItem.to"
            class="flex items-center gap-2 border-b-2 px-1 pb-3 text-sm"
            :class="
              isActiveMenuItem(menuItem.to)
                ? 'border-primary font-bold'
                : 'border-transparent'
            "
          >
            <component
              :is="menuItem.icon"
              class="size-4 shrink-0"
              :class="isActiveMenuItem(menuItem.to) ? 'text-primary' : ''"
            />
            <span>{{ menuItem.label }}</span>
          </NuxtLinkLocale>

          <div
            v-else
            class="flex cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-1 pb-3 text-sm opacity-70"
          >
            <component
              :is="menuItem.icon"
              class="size-4 shrink-0"
            />
            <span>{{ menuItem.label }}</span>
            <span class="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">Soon</span>
          </div>
        </li>
      </ul>
    </div>
  </nav>
  
  <!-- Add Entity Modal -->
  <AddEntityModal v-model:open="showAddEntityModal" />
</template>
