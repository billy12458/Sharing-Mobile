<template>
  <MobileLayout>
    <div class="page home-page">
      <section class="hero">
        <div class="hero-content">
          <div class="hero-kicker">Quicky Sharing</div>
          <h1>{{ t('home.title') }}</h1>
          <p>{{ t('home.subtitle') }}</p>
          <div class="hero-actions">
            <van-button type="primary" size="large" round @click="goRegister">{{ t('home.cta') }}</van-button>
            <van-button plain size="large" round @click="goFiles">{{ t('home.files') }}</van-button>
          </div>
        </div>
      </section>

      <section class="page-content">
        <van-notice-bar left-icon="volume-o" :text="t('home.skeleton')" />

        <div class="section-title">{{ t('home.notice') }}</div>
        <div class="card notice-card">
          <div class="notice-row"><span>2026/08/13</span><strong>Quicky Sharing Mobile</strong></div>
          <p>{{ t('home.skeleton') }}</p>
        </div>

        <div class="section-title">{{ t('home.quickStart') }}</div>
        <div class="quick-grid">
          <button class="quick-card card" type="button" @click="goFiles">
            <van-icon name="description" size="26" color="#1989fa" />
            <strong>{{ t('home.files') }}</strong>
            <span>{{ t('files.title') }}</span>
          </button>
          <button class="quick-card card" type="button" @click="goExtract">
            <van-icon name="coupon-o" size="26" color="#7c5cff" />
            <strong>{{ t('home.share') }}</strong>
            <span>{{ t('navigation.extractCode') }}</span>
          </button>
          <button class="quick-card card" type="button" @click="goProfile">
            <van-icon name="user-o" size="26" color="#09a66d" />
            <strong>{{ t('home.profile') }}</strong>
            <span>{{ t('profile.account') }}</span>
          </button>
        </div>
      </section>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'

const { t } = useI18n()
const router = useRouter()

const goRegister = () => router.push('/register')
const goFiles = () => router.push('/files')
const goExtract = () => router.push('/extract')
const goProfile = () => router.push('/profile')
</script>

<style scoped>
.home-page {
  background:
    radial-gradient(circle at top right, rgba(25, 137, 250, 0.18), transparent 34%),
    linear-gradient(180deg, #f8fbff 0%, #f6f7f8 30%);
}

.hero {
  position: relative;
  overflow: hidden;
  min-height: 360px;
  padding: 48px 18px 42px;
  color: #fff;
  background:
    linear-gradient(135deg, rgba(5, 15, 30, 0.86), rgba(8, 24, 43, 0.62)),
    url('/images/bk2.jpg') center / cover;
}

.hero::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.08), transparent 34%);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
  text-align: center;
}

.hero-kicker {
  margin-bottom: 14px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.72;
}

.hero h1 {
  margin: 0;
  font-size: clamp(28px, 7vw, 40px);
  line-height: 1.24;
}

.hero p {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.notice-card {
  padding: 16px;
}

.notice-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.notice-row span {
  flex: 0 0 auto;
  color: var(--qs-muted);
}

.notice-row strong {
  text-align: right;
}

.notice-card p {
  margin: 10px 0 0;
  line-height: 1.65;
  color: #666;
  font-size: 14px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quick-card {
  display: flex;
  min-height: 132px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border: 0;
  text-align: left;
}

.quick-card strong {
  font-size: 15px;
}

.quick-card span {
  font-size: 12px;
  color: var(--qs-muted);
}

@media (min-width: 560px) {
  .quick-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
