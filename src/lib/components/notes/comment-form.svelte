<script lang="ts">
  import { onMount } from "svelte";

  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Label from "$lib/components/ui/label.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import {
    loadCommentAuthor,
    saveCommentAuthor,
  } from "$lib/comments/author-storage";
  import { getLocaleContext } from "$lib/i18n/context";

  type Props = {
    parentId?: string;
    compact?: boolean;
    defaultName?: string;
    defaultEmail?: string;
    error?: string;
    onCancel?: () => void;
  };

  let {
    parentId,
    compact = false,
    defaultName = "",
    defaultEmail = "",
    error,
    onCancel,
  }: Props = $props();

  const { t } = getLocaleContext();

  let authorName = $state("");
  let authorEmail = $state("");
  let hydrated = $state(false);

  onMount(() => {
    const stored = loadCommentAuthor();
    authorName = defaultName || stored.name;
    authorEmail = defaultEmail || stored.email;
    hydrated = true;
  });

  $effect(() => {
    if (!hydrated) {
      return;
    }

    if (defaultName) {
      authorName = defaultName;
    }
    if (defaultEmail) {
      authorEmail = defaultEmail;
    }
  });

  const handleSubmit = () => {
    saveCommentAuthor({
      name: authorName.trim(),
      email: authorEmail.trim(),
    });
  };
</script>

<form
  method="POST"
  action="?/comment"
  class="space-y-3"
  onsubmit={handleSubmit}
>
  <input type="hidden" name="parentId" value={parentId ?? ""} />

  {#if error}
    <p class="font-pixel text-destructive text-[8px] uppercase" role="alert">
      {error}
    </p>
  {/if}

  {#if !compact}
    <p class="type-section">{t("comments.join")}</p>
  {/if}

  <div class="grid gap-3 sm:grid-cols-2">
    <div class="space-y-1.5">
      <Label for={parentId ? `name-${parentId}` : "comment-name"}>
        {t("comments.name")}
      </Label>
      <Input
        id={parentId ? `name-${parentId}` : "comment-name"}
        name="authorName"
        required
        maxlength={80}
        autocomplete="name"
        placeholder={t("comments.namePlaceholder")}
        bind:value={authorName}
      />
    </div>
    <div class="space-y-1.5">
      <Label for={parentId ? `email-${parentId}` : "comment-email"}>
        {t("comments.email")}
      </Label>
      <Input
        id={parentId ? `email-${parentId}` : "comment-email"}
        name="authorEmail"
        type="email"
        required
        autocomplete="email"
        placeholder={t("comments.emailPlaceholder")}
        bind:value={authorEmail}
      />
    </div>
  </div>

  <div class="space-y-1.5">
    <Label for={parentId ? `body-${parentId}` : "comment-body"}>
      {t("comments.body")}
    </Label>
    <Textarea
      id={parentId ? `body-${parentId}` : "comment-body"}
      name="body"
      required
      maxlength={2000}
      rows={compact ? 3 : 4}
      placeholder={t("comments.bodyPlaceholder")}
    />
  </div>

  <div class="flex flex-wrap gap-2">
    <Button type="submit" size="sm">{t("comments.submit")}</Button>
    {#if onCancel}
      <Button type="button" variant="outline" size="sm" onclick={onCancel}>
        {t("comments.cancel")}
      </Button>
    {/if}
  </div>
</form>