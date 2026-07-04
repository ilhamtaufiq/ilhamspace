<script lang="ts">
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";

  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<PageTitle href="/login">login</PageTitle>

<div class="pixel-border bg-card mx-auto max-w-sm p-6">
  <form method="POST" class="space-y-4">
    {#if form?.error}
      <p
        class="font-pixel text-destructive text-[8px] uppercase"
        role="alert"
      >
        {form.error}
      </p>
    {/if}

    <div class="space-y-2">
      <Label for="email">Email</Label>
      <Input
        id="email"
        name="email"
        type="email"
        autocomplete="email"
        required
        value={form?.email ?? ""}
        placeholder="you@example.com"
      />
    </div>

    <div class="space-y-2">
      <Label for="password">Password</Label>
      <Input
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        placeholder="••••••••"
      />
    </div>

    <Button type="submit" class="w-full">Sign in</Button>
  </form>
</div>