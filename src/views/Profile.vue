<template>
  <MobileLayout>
    <div class="profile-page">
      <van-loading v-if="loading" class="loading" size="24px" vertical>
        {{ t('profile.loading') }}
      </van-loading>

      <template v-else-if="profile">
        <van-cell-group inset class="profile-card">
          <div class="profile-main">
            <van-image class="avatar" round fit="cover" :src="avatarSource" :alt="t('profile.avatarAlt')">
              <template #error>
                <div class="avatar-fallback">
                  {{ avatarInitial }}
                </div>
              </template>

              <template #loading>
                <van-loading size="20px" />
              </template>
            </van-image>

            <div class="username">
              <van-icon name="manager" />
              {{ profile.userName }}
            </div>

            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">
                  {{ fansCount }}
                </div>
                <div class="stat-label">
                  {{ t('profile.followers') }}
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-value">
                  {{ followsCount }}
                </div>
                <div class="stat-label">
                  {{ t('profile.following') }}
                </div>
              </div>

              <button type="button" class="stat-item location-button" @click="showLocation">
                <div class="stat-value">
                  {{ t('profile.view') }}
                </div>
                <div class="stat-label">
                  {{ t('profile.location') }}
                </div>
              </button>
            </div>

            <van-button block type="success" :disabled="signDisabled" :loading="signLoading" @click="handleSignIn">
              {{
                signDisabled
                  ? t('profile.signedToday')
                  : t('profile.signIn')
              }}
            </van-button>

            <van-button block type="primary" plain class="edit-profile-button" @click="openEditProfile">
              {{ t('profile.editProfile') }}
            </van-button>
          </div>
        </van-cell-group>

        <van-cell-group inset class="account-card">
          <van-cell :title="t('profile.accountId')" :value="profile.userId || '-'" />

          <van-cell :title="t('profile.email')" :value="profile.email || '-'" />

          <van-cell :title="t('profile.sex')" :value="profile.sex || '-'" />

          <van-cell :title="t('profile.age')" :value="profile.age ?? '-'" />

          <van-cell :title="t('profile.phone')" :value="profile.phone || '-'" />

          <van-cell :title="t('profile.registeredAt')" :value="formatDate(profile.start_time)" />

          <van-cell :title="t('profile.motto')" :value="profile.motto || t('profile.noMotto')" />
        </van-cell-group>

        <van-cell-group inset class="secondary-nav-card">
          <van-cell
            :title="t('profile.mySection')"
            class="section-title"
          />

          <!-- <van-cell
            is-link
            icon="description"
            :title="t('profile.personalInfo')"
            @click="openProfileSection('personalInfo')"
          /> -->

          <van-cell
            is-link
            icon="clock-o"
            :title="t('profile.history')"
            @click="openProfileSection('history')"
          />

          <van-cell
            is-link
            icon="star-o"
            :title="t('profile.collections')"
            @click="openProfileSection('collections')"
          />

          <van-cell
            is-link
            icon="friends-o"
            :title="t('profile.followersSection')"
            @click="openProfileSection('followers')"
          />

          <van-cell
            is-link
            icon="friends-o"
            :title="t('profile.subscriptions')"
            @click="openProfileSection('subscriptions')"
          />
        </van-cell-group>

        <van-cell-group inset class="secondary-nav-card management-card">
          <van-cell
            :title="t('profile.securitySection')"
            class="section-title"
          />

          <van-cell
            is-link
            icon="calendar-o"
            :title="t('profile.loginLogs')"
            @click="openProfileSection('loginLogs')"
          />

          <van-cell
            is-link
            icon="apps-o"
            :title="t('profile.sessionManagement')"
            @click="openProfileSection('sessions')"
          />
        </van-cell-group>
      </template>

      <van-empty v-else :description="t('profile.loadFailed')" />

      <van-dialog v-model:show="locationVisible" :title="t('profile.location')" :show-cancel-button="false">
        <div class="location-content">
          {{ profile?.ip || t('profile.noLocation') }}
        </div>
      </van-dialog>

      <van-dialog v-model:show="editVisible" :title="t('profile.editProfile')" :show-cancel-button="true"
        :before-close="handleEditDialogClose">
        <van-form @submit="saveProfile">
          <div class="edit-form">
            <van-field v-model="editForm.userName" name="userName" :label="t('profile.nickname')"
              :placeholder="t('profile.nicknamePlaceholder')" clearable maxlength="32" :rules="[
                {
                  required: true,
                  message: t('profile.nicknameRequired'),
                },
                {
                  validator: validateNickname,
                  message: t('profile.nicknameLength'),
                },
              ]" />

            <van-field :model-value="editForm.sex" is-link readonly name="sex" :label="t('profile.sex')"
              :placeholder="t('profile.sexPlaceholder')" @click="sexPickerVisible = true" />

            <van-field v-model="editForm.age" name="age" type="digit" :label="t('profile.age')"
              :placeholder="t('profile.agePlaceholder')" maxlength="3" :rules="[
                {
                  required: true,
                  message: t('profile.ageRequired'),
                },
                {
                  validator: validateAge,
                  message: t('profile.ageInvalid'),
                },
              ]" />

            <van-field v-model="editForm.motto" name="motto" type="textarea" rows="4" autosize maxlength="100"
              show-word-limit :label="t('profile.motto')" :placeholder="t('profile.mottoPlaceholder')" :rules="[
                {
                  required: true,
                  message: t('profile.mottoRequired'),
                },
                {
                  validator: validateMotto,
                  message: t('profile.mottoLength'),
                },
              ]" />

            <div class="edit-hint">
              {{ t('profile.editReadonlyHint') }}
            </div>

            <!-- <van-button
              block
              type="primary"
              native-type="submit"
              :loading="editSaving"
            >
              {{ t('common.confirm') }}
            </van-button> -->
          </div>
        </van-form>
      </van-dialog>

      <van-action-sheet v-model:show="sexPickerVisible" :actions="sexActions" :cancel-text="t('common.cancel')"
        close-on-click-action @select="handleSexSelect" />
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'
import {
  useI18n,
} from 'vue-i18n'
import {
  useRouter,
} from 'vue-router'
import {
  showFailToast,
  showSuccessToast,
} from 'vant'

import MobileLayout from '@/layouts/MobileLayout.vue'

import {
  getMyFansAndFollows,
  getMyProfile,
  getTodaySign,
  signInToday,
  updateMyProfile,
  type Profile,
} from '@/api/profile'

import { getIsLogin } from '@/api/user'

const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const profile = ref<Profile | null>(null)

const fansCount = ref(0)
const followsCount = ref(0)

const signDisabled = ref(false)
const signLoading = ref(false)

const locationVisible = ref(false)

const editVisible = ref(false)
const editSaving = ref(false)
const sexPickerVisible = ref(false)

const editForm = reactive({
  userName: '',
  sex: '',
  age: '',
  motto: '',
})

const sexActions = computed(() => [
  {
    name: t('profile.male'),
    value: '男',
  },
  {
    name: t('profile.female'),
    value: '女',
  },
  {
    name: t('profile.secretSex'),
    value: '保密',
  },
])

const avatarSource = computed(() => {
  const avatar = profile.value?.avatar

  if (!avatar) {
    return ''
  }

  if (avatar.startsWith('data:image/')) {
    return avatar
  }

  return `data:image/jpeg;base64,${avatar}`
})

const avatarInitial = computed(() => {
  return (
    profile.value?.userName?.charAt(0).toUpperCase() ||
    'Q'
  )
})

async function ensureLogin() {
  try {
    const loggedIn = await getIsLogin()

    if (!loggedIn) {
      await router.replace({
        path: '/login',
        query: {
          redirect: router.currentRoute.value.fullPath,
        },
      })

      return false
    }

    return true
  } catch {
    await router.replace({
      path: '/login',
      query: {
        redirect: router.currentRoute.value.fullPath,
      },
    })

    return false
  }
}

async function loadProfile() {
  if (!(await ensureLogin())) {
    return
  }

  loading.value = true

  try {
    const [
      profileData,
      countData,
      signedToday,
    ] = await Promise.all([
      getMyProfile(),
      getMyFansAndFollows(),
      getTodaySign(),
    ])

    profile.value = profileData
    fansCount.value =
      countData?.fansCount || 0
    followsCount.value =
      countData?.followsCount || 0
    signDisabled.value = signedToday
  } catch (error: any) {
    const message =
      error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('profile.loadFailed'),
    })
  } finally {
    loading.value = false
  }
}

function openEditProfile() {
  if (!profile.value) {
    return
  }

  editForm.userName =
    String(profile.value.userName || '')

  editForm.sex =
    String(profile.value.sex || '')

  editForm.age =
    profile.value.age != null
      ? String(profile.value.age)
      : ''

  editForm.motto =
    String(profile.value.motto || '')

  sexPickerVisible.value = false
  editVisible.value = true
}

function validateNickname(value: string) {
  const length = value.trim().length
  return length >= 4 && length <= 32
}

function validateAge(value: string) {
  const age = Number(value)

  return (
    Number.isInteger(age) &&
    age >= 1 &&
    age <= 130
  )
}

function validateMotto(value: string) {
  const length = value.trim().length
  return length >= 5 && length <= 100
}

function handleSexSelect(
  action: { value?: string },
) {
  editForm.sex = action.value || ''
  sexPickerVisible.value = false
}

async function handleEditDialogClose(
  action: string,
) {
  if (action === 'confirm') {
    return await saveProfile()
  }

  sexPickerVisible.value = false
  return true
}

async function saveProfile(): Promise<boolean> {
  if (editSaving.value) {
    return false
  }

  const userName = editForm.userName.trim()
  const sex = editForm.sex.trim()
  const age = Number(editForm.age)
  const motto = editForm.motto.trim()

  if (
    !validateNickname(userName) ||
    !validateAge(editForm.age) ||
    !validateMotto(motto)
  ) {
    return false
  }

  editSaving.value = true

  try {
    const response = await updateMyProfile({
      userName,
      sex,
      age,
      motto,
    })

    if (
      response.data.status !== undefined &&
      response.data.status !== 200
    ) {
      const message = response.data.msg

      throw new Error(
        typeof message === 'string'
          ? message
          : Array.isArray(message)
            ? message.join('\n')
            : t('profile.updateFailed'),
      )
    }

    if (profile.value) {
      profile.value = {
        ...profile.value,
        userName,
        sex,
        age,
        motto,
      }
    }

    showSuccessToast({
      message: t('profile.updateSuccess'),
      duration: 2000,
    })

    return true
  } catch (error: any) {
    const message =
      error?.response?.data?.msg ||
      error?.message

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('profile.updateFailed'),
      duration: 2500,
    })

    return false
  } finally {
    editSaving.value = false
  }
}
async function handleSignIn() {
  if (
    signDisabled.value ||
    signLoading.value
  ) {
    return
  }

  signLoading.value = true

  try {
    const signed =
      await signInToday()

    if (signed) {
      signDisabled.value = true

      showSuccessToast({
        message: t('profile.signInSuccess'),
        duration: 2000,
      })
    } else {
      await refreshSignState()
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('profile.signInFailed'),
      duration: 2500,
    })
  } finally {
    signLoading.value = false
  }
}

async function refreshSignState() {
  try {
    signDisabled.value =
      await getTodaySign()
  } catch {
  }
}

function openProfileSection(
  section:
    | 'personalInfo'
    | 'history'
    | 'collections'
    | 'followers'
    | 'subscriptions'
    | 'loginLogs'
    | 'sessions',
) {
  const routes: Record<string, string> = {
    personalInfo: '/profile',
    history: '/profile/history',
    collections: '/profile/collections',
    followers: '/profile/followers',
    subscriptions: '/profile/subscriptions',
    loginLogs: '/profile/login-logs',
    sessions: '/profile/sessions',
  }

  const path = routes[section]

  if (!path || path === '/profile') {
    return
  }

  router.push(path)
}

function showLocation() {
  locationVisible.value = true
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-page {
  min-height: 100%;
  padding: 16px 12px 28px;
  background: #f7f8fa;
}

.profile-card {
  overflow: hidden;
}

.profile-main {
  padding: 22px 14px 18px;
  text-align: center;
}

.avatar {
  display: block;
  width: 100px;
  height: 100px;
  margin: 0 auto 8px;
  overflow: hidden;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #409eff;
  color: #fff;
  font-size: 30px;
  font-weight: 600;
}

.username {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 2px 0 20px;
  color: #222;
  font-size: 20px;
  font-weight: 600;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 18px;
}

.stat-item {
  position: relative;
  min-width: 0;
  padding: 4px 8px;
  border: 0;
  background: transparent;
  color: #1989fa;
  text-align: center;
}

.stat-item+.stat-item::before {
  position: absolute;
  top: 10%;
  left: 0;
  width: 1px;
  height: 80%;
  background: #eee;
  content: '';
}

.stat-value {
  font-size: 16px;
  line-height: 24px;
}

.stat-label {
  margin-top: 3px;
  font-size: 13px;
  line-height: 20px;
}

.location-button {
  cursor: pointer;
}

.location-button:active {
  background: #f5f7fa;
  border-radius: 6px;
}

.edit-profile-button {
  margin-top: 10px;
}

.account-card {
  margin-top: 14px;
}

.secondary-nav-card {
  margin-top: 14px;
}

.management-card {
  margin-top: 10px;
}

.section-title {
  color: #222;
  font-size: 14px;
  font-weight: 600;
  background: #fafafa;
}

.location-content {
  min-height: 70px;
  padding: 20px;
  color: #555;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  word-break: break-word;
}

.edit-form {
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px 12px 16px;
}

.edit-hint {
  padding: 10px 4px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 70px 0;
}
</style>
