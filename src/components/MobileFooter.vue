<template>
  <footer class="mobile-footer">
    <section class="footer-share">
      <h2>{{ t('footer.shareTitle') }}</h2>

      <div class="share-wrap">
        <Share
          :url="shareUrl"
          :title="shareTitle"
          :description="shareDescription"
          :douban="true"
          :we-chat="false"
          :facebook="true"
          :twitter="true"
          :q-zone="false"
        />
      </div>
    </section>

    <section class="footer-info">
      <div>{{ t('footer.siteInfo') }}</div>
      <div>{{ t('footer.icp') }}</div>
      <div>{{ t('footer.phone') }}</div>
      <div>
        {{ locale === 'en-US' ? 'Website email: ' : '网站邮箱：' }}
        quickysharing<span aria-hidden="true">&#64;</span>foxmail.com
      </div>
    </section>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Share } from 'vue3-social-share'
import 'vue3-social-share/lib/index.css'

const { t, locale } = useI18n()

const shareUrl = 'https://m.quickysharing.cn'
const shareTitle = 'Quicky Sharing'
const shareDescription = computed(() =>
  locale.value === 'en-US'
    ? 'Quicky Sharing official website'
    : 'Quicky Sharing 官方网站',
)
</script>

<style scoped>
.mobile-footer {
  width: 100%;
  margin: 0;
  padding: 0;
  background: var(--qs-surface);
  border-top: 1px solid var(--qs-border);
  text-align: center;
}

.footer-share {
  margin: 0;
  padding: 10px 0 4px;
}

.footer-share h2 {
  margin: 0 0 8px;
  color: var(--qs-text);
  font-size: 17px;
  line-height: 1.35;
  font-weight: 700;
}

.share-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  margin: 0;
  padding: 0;
}

.share-wrap :deep(ul),
.share-wrap :deep(ol),
.share-wrap :deep(.share-list) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: nowrap !important;
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

.share-wrap :deep(li) {
  flex: 0 0 auto !important;
  margin: 0 4px !important;
}

.footer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0 0 12px;
  color: var(--qs-muted);
  font-size: 12px;
  line-height: 1.4;
}

.footer-info > div {
  margin: 0;
  padding: 0;
  white-space: nowrap;
}

@media (max-width: 380px) {
  .footer-info {
    font-size: 11px;
  }
}
</style>
