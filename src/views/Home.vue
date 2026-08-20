<template>
  <MobileLayout>
    <div class="page home-page">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-glow hero-glow-one"></div>
        <div class="hero-glow hero-glow-two"></div>
        <div class="hero-content">
          <div class="hero-kicker">QUICKY SHARING</div>
          <h1>{{ localized('快速便捷管理你的文件', 'Manage your files with ease') }}</h1>
          <p>{{ localized('驱动你的业务', 'Drive your workflow') }}</p>

          <div class="hero-actions">
            <van-button type="primary" size="large" round block @click="goRegister">
              {{ localized('免费注册', 'Sign up for free') }}
            </van-button>
            <van-button plain size="large" round block @click="goUserStatement">
              {{ localized('用户须知', 'User Statement') }}
            </van-button>
          </div>
        </div>
      </section>

      <section class="content-wrap">
        <!-- Random announcement banner, mirroring the old site -->
        <van-notice-bar
          left-icon="volume-o"
          :text="currentAnnouncement"
          scrollable
          :delay="4"
          :speed="70"
          @replay="pickAnnouncement"
        />

        <!-- Website footprint + announcements -->
        <section class="section-block">
          <div class="section-heading">
            <div>
              <h2>{{ localized('网站足迹 & 公告', 'Website Footprint & Announcements') }}</h2>
              <p>{{ localized('记录网站从开发到上线的几个重要节点，以及早期发布的公告。', 'Key milestones and the original announcements of the website.') }}</p>
            </div>
          </div>

          <div class="history-card card">
            <div
              v-for="(item, index) in history"
              :key="item.date"
              class="history-item"
              :class="{ 'is-last': index === history.length - 1 }"
            >
              <div class="history-rail">
                <span class="history-dot"></span>
              </div>
              <div class="history-main">
                <div class="history-meta">{{ item.date }}</div>
                <strong>{{ localized(item.zhTitle, item.enTitle) }}</strong>
                <p>{{ localized(item.zhDescription, item.enDescription) }}</p>
              </div>
            </div>
          </div>

          <div class="announcement-list card">
            <van-cell
              v-for="item in announcements"
              :key="item.date + item.title"
              center
              is-link
              :url="item.url"
              target="_blank"
            >
              <template #title>
                <div class="announcement-title">
                  <span class="announcement-index">{{ announcements.indexOf(item) + 1 }}</span>
                  <span>{{ localized(item.zhTitle, item.enTitle) }}</span>
                </div>
              </template>
              <template #value>{{ item.date }}</template>
            </van-cell>
          </div>
        </section>

        <!-- Six original major features -->
        <section class="section-block">
          <div class="section-heading">
            <div>
              <h2>{{ localized('主要功能', 'Main Features') }}</h2>
              <p>{{ localized('把原网站的六项主要功能保留下来，但以更适合手机的方式呈现。', 'The original six core features, redesigned for mobile.') }}</p>
            </div>
          </div>

          <div class="feature-grid">
            <button
              v-for="feature in features"
              :key="feature.key"
              type="button"
              class="feature-card card"
              @click="openFeature(feature)"
            >
              <div class="feature-icon-wrap" :style="{ background: feature.bg, color: feature.color }">
                <van-icon :name="feature.icon" size="28" />
              </div>
              <div class="feature-copy">
                <strong>{{ localized(feature.zhTitle, feature.enTitle) }}</strong>
                <p>{{ localized(feature.zhDescription, feature.enDescription) }}</p>
              </div>
              <van-icon name="arrow" class="feature-arrow" size="18" />
            </button>
          </div>
        </section>
      </section>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'

interface LocalizedText {
  zh: string
  en: string
}

interface HistoryItem {
  date: string
  zhTitle: string
  enTitle: string
  zhDescription: string
  enDescription: string
}

interface AnnouncementItem {
  date: string
  zhTitle: string
  enTitle: string
  url: string
}

interface FeatureItem {
  key: string
  icon: string
  color: string
  bg: string
  route?: string
  externalUrl?: string
  zhTitle: string
  enTitle: string
  zhDescription: string
  enDescription: string
}

const router = useRouter()
const { locale } = useI18n()

const localized = (zh: string, en: string) => locale.value === 'en-US' ? en : zh

const history: HistoryItem[] = [
  {
    date: '2023/5/1',
    zhTitle: '成功上线',
    enTitle: 'Official launch',
    zhDescription: 'Quicky-Sharing 团队于 2023/5/1 成功上线网站。',
    enDescription: 'The Quicky-Sharing team officially launched the website on May 1, 2023.',
  },
  {
    date: '2023/4/25',
    zhTitle: '测试基本完成',
    enTitle: 'Testing basically completed',
    zhDescription: 'Quicky-Sharing 团队于 2023/4/25 基本完成网站测试。',
    enDescription: 'The Quicky-Sharing team basically completed website testing on April 25, 2023.',
  },
  {
    date: '2023/4/15',
    zhTitle: '前后端开发基本完成',
    enTitle: 'Frontend and backend development basically completed',
    zhDescription: 'Quicky-Sharing 团队于 2023/4/15 基本完成前后端开发。',
    enDescription: 'Frontend and backend development was basically completed on April 15, 2023.',
  },
  {
    date: '2022/7/21',
    zhTitle: '开始开发网站',
    enTitle: 'Website development started',
    zhDescription: 'Quicky-Sharing 团队于 2022/7/21 开始开发网站。',
    enDescription: 'The Quicky-Sharing team started developing the website on July 21, 2022.',
  },
]

const announcements: AnnouncementItem[] = [
  {
    date: '2023-04-01',
    zhTitle: '网站使用文档',
    enTitle: 'Website User Documentation',
    url: 'https://www.quickysharing.cn/docs',
  },
  {
    date: '2023-04-01',
    zhTitle: '登录与注册流程',
    enTitle: 'Login and Registration',
    url: 'https://www.quickysharing.cn/docs/markdown/login-and-register.html',
  },
  {
    date: '2023-04-03',
    zhTitle: '文件搜索教程',
    enTitle: 'File Search Tutorial',
    url: 'https://www.quickysharing.cn/docs/markdown/file-search.html',
  },
  {
    date: '2023-04-03',
    zhTitle: '封禁规则说明',
    enTitle: 'Ban Rules',
    url: 'https://www.quickysharing.cn/docs/markdown/disable-rules.html',
  },
  {
    date: '2023-04-03',
    zhTitle: '举报与反馈',
    enTitle: 'Report and Feedback',
    url: 'https://www.quickysharing.cn/Report',
  },
  {
    date: '2023-04-05',
    zhTitle: '举报与反馈教程',
    enTitle: 'Report and Feedback Tutorial',
    url: 'https://www.quickysharing.cn/docs/markdown/report-and-suggestion.html',
  },
  {
    date: '2023-04-10',
    zhTitle: '用户须知',
    enTitle: 'User Statement',
    url: 'https://www.quickysharing.cn/docs/markdown/user-statement.html',
  },
  {
    date: '2023-04-13',
    zhTitle: '隐私声明',
    enTitle: 'Privacy Statement',
    url: 'https://www.quickysharing.cn/docs/markdown/user-privacy.html',
  },
  {
    date: '2023-04-22',
    zhTitle: '关于我们',
    enTitle: 'About Us',
    url: 'https://www.quickysharing.cn/docs/markdown/about-us.html',
  },
  {
    date: '2023-05-01',
    zhTitle: 'Github 主页',
    enTitle: 'GitHub Homepage',
    url: 'https://github.com/billy12458',
  },
  {
    date: '2023-05-03',
    zhTitle: '备案中心',
    enTitle: 'ICP Filing Center',
    url: 'https://www.beian.gov.cn',
  },
]

const features: FeatureItem[] = [
  {
    key: 'files',
    icon: 'description',
    color: '#1989fa',
    bg: '#eaf4ff',
    route: '/files',
    zhTitle: '个人文件',
    enTitle: 'My Files',
    zhDescription: '管理文件、修改相关信息、分享预览等功能',
    enDescription: 'Manage files, edit metadata, share and preview files.',
  },
  {
    key: 'ranking',
    icon: 'bar-chart-o',
    color: '#7c5cff',
    bg: '#f0ebff',
    route: '/ranking',
    zhTitle: '排行榜',
    enTitle: 'Ranking',
    zhDescription: '日榜、周榜、月榜，了解热门文件的详情',
    enDescription: 'Daily, weekly and monthly rankings for popular files.',
  },
  {
    key: 'search',
    icon: 'search',
    color: '#09a66d',
    bg: '#e9fbf4',
    route: '/search',
    zhTitle: '搜索',
    enTitle: 'Search',
    zhDescription: '多种条件复合搜索，精确定位你的需求',
    enDescription: 'Use multiple search conditions to find what you need.',
  },
  {
    key: 'tags',
    icon: 'label-o',
    color: '#e67e22',
    bg: '#fff4e8',
    route: '/tags',
    zhTitle: '标签',
    enTitle: 'Tags',
    zhDescription: '不同类型、多种标签帮助你发现心仪的文件',
    enDescription: 'Browse files through categories and tags.',
  },
  {
    key: 'documents',
    icon: 'notes-o',
    color: '#3f8cff',
    bg: '#eaf2ff',
    externalUrl: 'https://www.quickysharing.cn/docs',
    zhTitle: '文档',
    enTitle: 'Documentation',
    zhDescription: '深入了解网站相关功能，高效使用它们',
    enDescription: 'Learn how the website works and use its features efficiently.',
  },
  {
    key: 'suggestions',
    icon: 'comment-o',
    color: '#d94b8a',
    bg: '#fff0f6',
    route: '/suggestions',
    zhTitle: '建议',
    enTitle: 'Suggestions',
    zhDescription: '多种渠道高效沟通，共同帮助网站持续改进',
    enDescription: 'Share feedback and help improve Quicky Sharing.',
  },
]

const currentAnnouncementIndex = ref(0)

const currentAnnouncement = computed(() => {
  const item = announcementMessages[currentAnnouncementIndex.value]
  return localized(item.zh, item.en)
})

const announcementMessages: Array<LocalizedText> = [
  {
    zh: '欢迎来到 Quicky-Sharing 官方网站，我们提供多种文件的上传下载等功能，所有功能完全免费且无使用限制，认准网址：https://www.quickysharing.cn',
    en: 'Welcome to the official Quicky-Sharing website. We provide free file upload and download features without usage limits. Official website: https://www.quickysharing.cn',
  },
  {
    zh: '当你发送违规评论并且被成功举报，您的账号将会被封禁1天，同时经验值减少一定的数量。',
    en: 'If you post a violating comment and it is successfully reported, your account will be banned for 1 day and some experience points will be deducted.',
  },
  {
    zh: '当你上传含有违规内容的文件并且被成功举报，您的账号将会被永久封禁，同时经验值减少一定的数量。',
    en: 'Uploading a violating file that is successfully reported will result in a permanent account ban and an experience-point deduction.',
  },
  {
    zh: '在搜索页面中搜索文件/用户请输入内容后点击下方对应的标签即可。按照标签搜索则需要先选中对应的标签。',
    en: 'On the search page, enter your query and select the corresponding option below. To search by tag, select the tag first.',
  },
  {
    zh: '举报时选择不匿名可以获取更多的经验值哦。',
    en: 'Choosing a non-anonymous report can earn you more experience points.',
  },
  {
    zh: '上传文件时在输入描述后点击空白处可以检验您的描述是否符合规则。',
    en: 'After entering a file description, click elsewhere on the page to check whether it complies with the rules.',
  },
  {
    zh: '单次上传文件的大小限制为128MB。同时考虑到存储空间的问题，本网站不支持上传视频、音频等类型的文件，敬请谅解。',
    en: 'The maximum file size per upload is 128 MB. Video and audio uploads are not supported because of storage constraints.',
  },
  {
    zh: '我们的文件推荐是根据样本采样算法得到的，与你的文件浏览习惯无关，我们也不会滥用您的历史记录。',
    en: 'Our file recommendations are generated using sampling algorithms and are not based on your browsing habits. We do not misuse your history.',
  },
  {
    zh: '如果对本网站有什么建议或者希望我们改进的地方，请登录后点击上方的建议标签到建议页面进行操作。',
    en: 'If you have suggestions or improvement ideas, sign in and use the Suggestions section to submit them.',
  },
  {
    zh: '本网站的文档仍在更新中，您可以联系 quickysharing@foxmail.com 来参与文档撰写，文档网址：https://www.quickysharing.cn/docs',
    en: 'The documentation is still being updated. You can contact quickysharing@foxmail.com to contribute. Documentation: https://www.quickysharing.cn/docs',
  },
  {
    zh: '本网站保证永远不含有任何形式的广告、商品推广、恶意弹窗以及付费功能。',
    en: 'Quicky Sharing does not contain advertisements, product promotions, malicious pop-ups or paid features.',
  },
  {
    zh: '本网站会不定期停机维护，添加一些必要的功能，对您带来的不便敬请谅解！',
    en: 'The website may occasionally go offline for maintenance and feature updates. We apologize for any inconvenience.',
  },
]

function pickAnnouncement() {
  currentAnnouncementIndex.value = Math.floor(Math.random() * announcementMessages.length)
}

function goRegister() {
  router.push('/register')
}

function goUserStatement() {
  window.open('https://www.quickysharing.cn/docs/markdown/user-statement.html', '_blank', 'noopener,noreferrer')
}

function openFeature(feature: FeatureItem) {
  if (feature.externalUrl) {
    window.open(feature.externalUrl, '_blank', 'noopener,noreferrer')
    return
  }
  if (feature.route) {
    router.push(feature.route)
  }
}

pickAnnouncement()
</script>

<style scoped>
.home-page {
  min-height: 100%;
  background: #f6f7f8;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 54px 20px 42px;
  color: #fff;
  background:
    linear-gradient(135deg, rgba(7, 17, 30, 0.96), rgba(19, 54, 86, 0.9)),
    radial-gradient(circle at 82% 20%, rgba(64, 158, 255, 0.45), transparent 34%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 620px;
  margin: 0 auto;
  text-align: center;
}

.hero-kicker {
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  opacity: 0.7;
}

.hero h1 {
  margin: 0;
  font-size: clamp(28px, 7vw, 38px);
  line-height: 1.25;
  font-weight: 800;
}

.hero p {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
}

.hero-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 26px;
}

.hero-actions :deep(.van-button) {
  min-width: 0;
  padding-inline: 10px;
}

.hero-glow {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(8px);
}

.hero-glow-one {
  top: -110px;
  right: -35px;
  background: rgba(64, 158, 255, 0.22);
}

.hero-glow-two {
  bottom: -120px;
  left: -50px;
  background: rgba(103, 194, 58, 0.12);
}

.content-wrap {
  max-width: 760px;
  margin: 0 auto;
  padding: 14px 14px calc(86px + env(safe-area-inset-bottom));
}

.section-block {
  margin-top: 20px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin: 0 2px 10px;
}

.section-heading h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
  font-weight: 800;
  color: #20242a;
}

.section-heading p {
  margin: 5px 0 0;
  color: #8a9098;
  font-size: 12px;
  line-height: 1.5;
}

.card {
  overflow: hidden;
  border: 1px solid #edf0f3;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 18px rgba(19, 31, 45, 0.05);
}

.history-card {
  padding: 8px 14px;
}

.history-item {
  position: relative;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 8px;
  min-height: 94px;
}

.history-rail {
  position: relative;
}

.history-rail::after {
  position: absolute;
  top: 20px;
  bottom: -4px;
  left: 8px;
  width: 2px;
  content: '';
  background: #dce9f8;
}

.history-item.is-last .history-rail::after {
  display: none;
}

.history-dot {
  position: absolute;
  top: 8px;
  left: 3px;
  z-index: 1;
  width: 12px;
  height: 12px;
  border: 3px solid #eaf4ff;
  border-radius: 50%;
  background: #1989fa;
}

.history-main {
  padding: 2px 0 16px;
}

.history-meta {
  margin-bottom: 4px;
  color: #8b939d;
  font-size: 11px;
}

.history-main strong {
  display: block;
  color: #24282e;
  font-size: 14px;
  line-height: 1.4;
}

.history-main p {
  margin: 5px 0 0;
  color: #707782;
  font-size: 12px;
  line-height: 1.55;
}

.announcement-list {
  margin-top: 12px;
}

.announcement-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  line-height: 1.4;
}

.announcement-title > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.announcement-index {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: #f2f4f7;
  color: #7b838c;
  font-size: 10px;
  font-weight: 700;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.feature-card {
  display: flex;
  min-width: 0;
  min-height: 156px;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  border: 0;
  text-align: left;
  color: inherit;
  cursor: pointer;
  transition: transform 0.16s ease;
}

.feature-card:active {
  transform: scale(0.98);
}

.feature-icon-wrap {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
}

.feature-copy {
  min-width: 0;
  margin-top: 12px;
  padding-right: 4px;
}

.feature-copy strong {
  display: block;
  color: #21262c;
  font-size: 15px;
  line-height: 1.4;
}

.feature-copy p {
  margin: 5px 0 0;
  color: #7d858f;
  font-size: 11px;
  line-height: 1.55;
}

.feature-arrow {
  align-self: flex-end;
  margin-top: auto;
  color: #a4abb4;
}

@media (min-width: 560px) {
  .feature-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 370px) {
  .hero-actions {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    gap: 8px;
  }

  .feature-card {
    padding: 13px;
  }
}
</style>
