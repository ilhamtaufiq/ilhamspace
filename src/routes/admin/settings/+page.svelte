<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Label from "$lib/components/ui/label.svelte";

  import type { ActionData, PageData } from "./$types";

  let {
    data,
    form,
  }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle href="/admin/settings">settings</PageTitle>

<section class="pixel-border bg-card max-w-2xl space-y-4 p-4">
  <div>
    <h2 class="font-pixel text-[10px] uppercase">Umami analytics</h2>
    <p class="font-retro text-muted-foreground mt-2 text-sm">
      Tracking uses the script below. <strong>View counts</strong> need API
      access — use an API token or your self-hosted Umami login (no API key
      menu required).
    </p>
  </div>

  <form method="POST" action="?/saveUmami" class="space-y-4">
    <label class="font-retro flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name="enabled"
        value="on"
        checked={data.settings.enabled}
        class="pixel-border size-4"
      />
      Enable Umami tracking and view counts
    </label>

    <div class="space-y-1.5">
      <Label for="umami-script-url">Script URL</Label>
      <input
        id="umami-script-url"
        name="scriptUrl"
        type="url"
        value={data.settings.scriptUrl}
        placeholder="https://umami.example.com/script.js (optional if API URL set)"
        class="font-retro pixel-border bg-background block w-full px-3 py-2 text-sm"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="umami-website-id">Website ID</Label>
      <input
        id="umami-website-id"
        name="websiteId"
        type="text"
        value={data.settings.websiteId}
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        class="font-retro pixel-border bg-background block w-full px-3 py-2 text-sm"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="umami-api-url">API URL</Label>
      <input
        id="umami-api-url"
        name="apiUrl"
        type="url"
        value={data.settings.apiUrl}
        placeholder="https://umami.example.com"
        class="font-retro pixel-border bg-background block w-full px-3 py-2 text-sm"
      />
      <p class="font-retro text-muted-foreground text-xs">
        Public base URL of your self-hosted Umami (no trailing slash). The
        ilhamspace server calls this for view counts.
      </p>
    </div>

    <div class="space-y-1.5">
      <Label for="umami-api-token">API token (optional)</Label>
      <input
        id="umami-api-token"
        name="apiToken"
        type="password"
        autocomplete="new-password"
        placeholder={data.settings.hasApiToken
          ? "Saved — leave blank to keep current token"
          : "Or use Umami login below"}
        class="font-retro pixel-border bg-background block w-full px-3 py-2 text-sm"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="umami-api-username">Umami login (self-hosted)</Label>
      <input
        id="umami-api-username"
        name="apiUsername"
        type="text"
        autocomplete="username"
        value={data.settings.apiUsername}
        placeholder="admin"
        class="font-retro pixel-border bg-background block w-full px-3 py-2 text-sm"
      />
    </div>

    <div class="space-y-1.5">
      <Label for="umami-api-password">Umami password</Label>
      <input
        id="umami-api-password"
        name="apiPassword"
        type="password"
        autocomplete="current-password"
        placeholder={data.settings.hasApiPassword
          ? "Saved — leave blank to keep current password"
          : "Password for your Umami dashboard"}
        class="font-retro pixel-border bg-background block w-full px-3 py-2 text-sm"
      />
      <p class="font-retro text-muted-foreground text-xs">
        Used server-side to read pageview stats. API URL is inferred from Script
        URL if empty.
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button type="submit" size="sm">Save settings</Button>
    </div>
  </form>

  <form method="POST" action="?/testUmami">
    <Button type="submit" size="sm" variant="outline">Test API connection</Button>
  </form>

  {#if form?.saveSuccess}
    <p class="font-pixel text-[8px] uppercase text-[var(--ring)]" role="status">
      Settings saved.
    </p>
  {/if}

  {#if form?.saveWarning}
    <p class="font-pixel text-[8px] uppercase text-muted-foreground" role="status">
      {form.saveWarning}
    </p>
  {/if}

  {#if form?.testSuccess}
    <p class="font-pixel text-[8px] uppercase text-[var(--ring)]" role="status">
      Umami API OK — homepage views: {form.testViews ?? 0}
    </p>
  {/if}

  {#if form?.saveError}
    <p class="font-pixel text-destructive text-[8px] uppercase" role="alert">
      {form.saveError}
    </p>
  {/if}

  {#if form?.testError}
    <p class="font-pixel text-destructive text-[8px] uppercase" role="alert">
      {form.testError}
    </p>
  {/if}
</section>