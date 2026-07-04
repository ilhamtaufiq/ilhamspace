<script lang="ts">
  import HeadMeta from "$lib/components/seo/head-meta.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import { buildPageTitle } from "$lib/seo/meta";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import { getLocaleContext } from "$lib/i18n/context";

  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
  const { t } = getLocaleContext();
</script>

<HeadMeta
  title={buildPageTitle(t("seo.loginTitle"))}
  description={t("seo.loginDescription")}
  path="/login"
  noindex
/>

<PageTitle href="/login">{t("login.title")}</PageTitle>

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
      <Label for="email">{t("login.email")}</Label>
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
      <Label for="password">{t("login.password")}</Label>
      <Input
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        placeholder="••••••••"
      />
    </div>

    <Button type="submit" class="w-full">{t("login.signIn")}</Button>
  </form>
</div>