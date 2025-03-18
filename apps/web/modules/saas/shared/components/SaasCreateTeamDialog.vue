<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  
  const { createTeamDialogOpen } = useDashboardState();
  const { user } = useUser();
  const { apiCaller } = useApiCaller();
  
  const emit = defineEmits<{
    success: [id: string];
  }>();

  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const alreadyOwnsTeam = ref(false);
  
  // Check if non-admin user already owns a team
  onMounted(async () => {
    if (!isAdmin.value && user.value) {
      const teams = await apiCaller.team.list.query();
      const ownedTeams = teams.filter(team => 
        team.memberships.some(m => m.role === 'OWNER')
      );
      alreadyOwnsTeam.value = ownedTeams.length > 0;
    }
  });

  const handleCreateTeamSuccess = async (newTeamId: string) => {
    emit("success", newTeamId);
    createTeamDialogOpen.value = false;
  };
</script>

<template>
  <Dialog
    :open="createTeamDialogOpen"
    @update:open="(newVal) => (createTeamDialogOpen = newVal)"
  >
    <DialogContent>
      <DialogDescription class="sr-only">
        {{ $t("createTeam.title") }}
      </DialogDescription>
      <DialogHeader>
        <DialogTitle>
          {{ $t("createTeam.title") }}
        </DialogTitle>
      </DialogHeader>

      <!-- Show limit message for non-admin users who already own a team -->
      <SaasTeamLimitMessage v-if="!isAdmin && alreadyOwnsTeam" class="mb-4" />

      <!-- Show form only for admins or users who don't own a team yet -->
      <SaasCreateTeamForm
        v-if="isAdmin || !alreadyOwnsTeam"
        @success="(newTeam) => handleCreateTeamSuccess(newTeam.id)"
      />
    </DialogContent>
  </Dialog>
</template>
