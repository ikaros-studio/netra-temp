<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';
import { z } from 'zod';
import { useToast } from '@/modules/ui/components/toast';

const props = defineProps<{
  teamId: string;
}>();

const emit = defineEmits<{
  success: [];
}>();

const { t } = useTranslations();
const { apiCaller } = useApiCaller();
const { toast } = useToast();

const dialog = ref(false);

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email(),
  }),
);

const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: '',
  },
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await apiCaller.team.inviteMember.mutate({
      ...values,
      teamId: props.teamId,
      role: 'OWNER',
    });

    resetForm();
    dialog.value = false;

    toast({
      title: t('settings.team.members.inviteMember.notifications.success.title'),
      description: t('settings.team.members.inviteMember.notifications.success.description'),
      variant: 'success',
    });
    
    emit('success');
  } catch (error) {
    toast({
      title: t('settings.team.members.inviteMember.notifications.error.title'),
      description: t('settings.team.members.inviteMember.notifications.error.description'),
      variant: 'error',
    });
  }
});
</script>

<template>
  <Dialog v-model:open="dialog">
    <DialogTrigger asChild>
      <Button class="ml-auto" size="sm">
        <PlusIcon class="mr-2 size-4" />
        {{ $t('settings.team.members.inviteOwner') }}
      </Button>
    </DialogTrigger>
    
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('settings.team.members.inviteOwner') }}</DialogTitle>
        <DialogDescription>
          {{ $t('settings.team.members.inviteOwnerDescription') }}
        </DialogDescription>
      </DialogHeader>
      
      <Form :meta="meta" @submit="onSubmit">
        <div class="space-y-4">
          <FormField name="email">
            <FormLabel>{{ $t('settings.team.members.inviteMember.email') }}</FormLabel>
            <FormControl>
              <Input
                :placeholder="$t('settings.team.members.inviteMember.email')"
                type="email"
              />
            </FormControl>
            <FormMessage />
          </FormField>
        </div>
        
        <div class="mt-4 flex justify-end">
          <Button
            :disabled="isSubmitting"
            type="submit"
          >
            {{ $t('settings.team.members.inviteMember.submit') }}
          </Button>
        </div>
      </Form>
    </DialogContent>
  </Dialog>
</template> 