<template>
  <van-cell-group inset class="comments-card">
    <van-cell>
      <template #title>
        <div class="comments-header">
          <span class="comments-title">{{ t('comments.title') }}</span>
          <span class="comments-count">
            {{ t('comments.count', { count: total }) }}
          </span>
        </div>
      </template>

      <template #right-icon>
        <van-button
          icon="replay"
          size="small"
          plain
          type="primary"
          :loading="loading"
          @click="loadComments(pageNum)"
        />
      </template>
    </van-cell>

    <div class="comment-composer">
      <van-field
        v-model="newComment"
        type="textarea"
        rows="2"
        maxlength="200"
        show-word-limit
        autosize
        :placeholder="t('comments.placeholder')"
      />

      <div class="composer-footer">
        <van-button
          type="primary"
          size="small"
          :loading="submitting"
          :disabled="!newComment.trim()"
          @click="submitTopLevelComment"
        >
          {{ t('comments.publish') }}
        </van-button>
      </div>
    </div>

    <van-loading
      v-if="loading && !comments.length"
      class="comments-loading"
      size="22px"
      vertical
    >
      {{ t('comments.loading') }}
    </van-loading>

    <van-empty
      v-else-if="!loading && commentsError"
      :description="t('comments.loadFailed')"
    />

    <van-empty
      v-else-if="!loading && !comments.length"
      :description="t('comments.empty')"
    />

    <template v-else>
      <article
        v-for="comment in comments"
        :key="comment.commentId"
        class="comment-item"
      >
        <img
          class="comment-avatar"
          :src="avatarUrl(comment.userId)"
          :alt="comment.userName || t('comments.unknownUser')"
          loading="lazy"
        />

        <div class="comment-body">
          <div class="comment-meta">
            <div class="comment-author-row">
              <span class="comment-author">
                {{ comment.userName || t('comments.unknownUser') }}
              </span>
              <span
                v-if="comment.toUserId"
                class="reply-target"
              >
                {{ t('comments.repliedTo', { name: comment.toUserId }) }}
              </span>
            </div>

            <span class="comment-time">
              {{ formatCommentTime(comment.commentTime) }}
            </span>
          </div>

          <div class="comment-content">{{ comment.content }}</div>

          <div class="comment-footer">
            <van-tag
              v-if="sentimentText(comment.sentiment)"
              :type="comment.sentiment === 1 ? 'success' : 'danger'"
              plain
            >
              {{ sentimentText(comment.sentiment) }}
            </van-tag>

            <div class="comment-actions">
              <van-button
                size="mini"
                plain
                type="primary"
                @click="openReply(comment)"
              >
                {{ t('comments.reply') }}
              </van-button>

              <van-button
                size="mini"
                plain
                type="warning"
                @click="openReport(comment)"
              >
                {{ t('comments.report') }}
              </van-button>

              <van-button
                v-if="isOwnComment(comment)"
                size="mini"
                plain
                type="danger"
                @click="removeComment(comment)"
              >
                {{ t('comments.delete') }}
              </van-button>
            </div>
          </div>

          <template v-if="comment.hasChildren">
            <van-button
              class="reply-toggle"
              size="small"
              plain
              type="primary"
              :loading="replyStates[comment.commentId]?.loading"
              @click="toggleReplies(comment)"
            >
              <van-icon
                :name="
                  expandedReplies[comment.commentId]
                    ? 'arrow-up'
                    : 'arrow-down'
                "
              />
              {{
                expandedReplies[comment.commentId]
                  ? t('comments.hideReplies')
                  : t('comments.showReplies')
              }}
            </van-button>

            <div
              v-if="expandedReplies[comment.commentId]"
              class="reply-list"
            >
              <article
                v-for="reply in replyStates[comment.commentId]?.items || []"
                :key="reply.commentId"
                class="reply-item"
              >
                <img
                  class="comment-avatar reply-avatar"
                  :src="avatarUrl(reply.userId)"
                  :alt="reply.userName || t('comments.unknownUser')"
                  loading="lazy"
                />

                <div class="comment-body">
                  <div class="comment-meta">
                    <div class="comment-author-row">
                      <span class="comment-author">
                        {{ reply.userName || t('comments.unknownUser') }}
                      </span>
                      <span
                        v-if="reply.toUserId"
                        class="reply-target"
                      >
                        {{
                          t('comments.repliedTo', {
                            name: reply.toUserId,
                          })
                        }}
                      </span>
                    </div>

                    <span class="comment-time">
                      {{ formatCommentTime(reply.commentTime) }}
                    </span>
                  </div>

                  <div class="comment-content">{{ reply.content }}</div>

                  <div class="comment-footer">
                    <van-tag
                      v-if="sentimentText(reply.sentiment)"
                      :type="reply.sentiment === 1 ? 'success' : 'danger'"
                      plain
                    >
                      {{ sentimentText(reply.sentiment) }}
                    </van-tag>

                    <div class="comment-actions">
                      <van-button
                        size="mini"
                        plain
                        type="primary"
                        @click="openReply(reply)"
                      >
                        {{ t('comments.reply') }}
                      </van-button>

                      <van-button
                        size="mini"
                        plain
                        type="warning"
                        @click="openReport(reply)"
                      >
                        {{ t('comments.report') }}
                      </van-button>

                      <van-button
                        v-if="isOwnComment(reply)"
                        size="mini"
                        plain
                        type="danger"
                        @click="removeComment(reply)"
                      >
                        {{ t('comments.delete') }}
                      </van-button>
                    </div>
                  </div>
                </div>
              </article>

              <van-empty
                v-if="
                  !replyStates[comment.commentId]?.loading &&
                  !replyStates[comment.commentId]?.items.length
                "
                image-size="64"
                :description="t('comments.noReplies')"
              />
            </div>
          </template>
        </div>
      </article>

      <van-pagination
        v-if="total > pageSize"
        v-model="pageNum"
        class="comments-pagination"
        :total-items="total"
        :items-per-page="pageSize"
        :show-page-size="5"
        force-ellipses
        @change="loadComments"
      />
    </template>
  </van-cell-group>

  <van-popup
    v-model:show="replyVisible"
    position="bottom"
    round
    closeable
    :style="{ maxHeight: '72%' }"
  >
    <div class="editor-panel">
      <h3>{{ replyTitle }}</h3>
      <van-field
        v-model="replyContent"
        type="textarea"
        rows="4"
        maxlength="200"
        show-word-limit
        autosize
        :placeholder="t('comments.replyPlaceholder')"
      />
      <div class="editor-actions">
        <van-button
          block
          plain
          @click="closeReply"
        >
          {{ t('common.cancel') }}
        </van-button>
        <van-button
          block
          type="primary"
          :loading="replySubmitting"
          :disabled="!replyContent.trim()"
          @click="submitReply"
        >
          {{ t('comments.sendReply') }}
        </van-button>
      </div>
    </div>
  </van-popup>

  <van-popup
    v-model:show="reportVisible"
    position="bottom"
    round
    closeable
    :style="{ maxHeight: '88%' }"
  >
    <div class="editor-panel report-panel">
      <h3>{{ t('comments.reportTitle') }}</h3>
      <p class="report-context">
        {{
          t('comments.reportTarget', {
            name:
              reportTarget?.userName || t('comments.unknownUser'),
          })
        }}
      </p>

      <div class="report-label">{{ t('comments.reportReason') }}</div>
      <van-radio-group v-model="reportType">
        <van-radio
          v-for="reason in reportReasons"
          :key="reason.value"
          :name="reason.value"
          class="report-reason"
        >
          {{ reason.label }}
        </van-radio>
      </van-radio-group>

      <van-field
        v-model="reportContent"
        class="report-content"
        type="textarea"
        rows="3"
        maxlength="500"
        show-word-limit
        autosize
        :placeholder="t('comments.reportPlaceholder')"
      />

      <van-cell
        :title="t('comments.reportAnonymous')"
        center
      >
        <template #right-icon>
          <van-switch v-model="reportAnonymous" size="20px" />
        </template>
      </van-cell>

      <div class="editor-actions">
        <van-button
          block
          plain
          @click="closeReport"
        >
          {{ t('common.cancel') }}
        </van-button>
        <van-button
          block
          type="danger"
          :loading="reportSubmitting"
          :disabled="
            !reportType ||
            reportContent.trim().length < 10
          "
          @click="submitReport"
        >
          {{ t('comments.submitReport') }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
} from 'vant'

import {
  addComment,
  deleteComment,
  getCommentReplies,
  getFileComments,
  reportComment,
  type FileComment,
} from '@/api/comments'
import {
  getIsLogin,
  getUserNameAndId,
  type UserNameAndId,
} from '@/api/user'

const props = defineProps<{
  fileId: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const comments = ref<FileComment[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)
const commentsError = ref(false)

const newComment = ref('')
const submitting = ref(false)

const currentUser = ref<UserNameAndId | null>(null)
const loggedIn = ref(false)

interface ReplyState {
  loading: boolean
  loaded: boolean
  items: FileComment[]
}

const replyStates = reactive<Record<string, ReplyState>>({})
const expandedReplies = reactive<Record<string, boolean>>({})

const replyVisible = ref(false)
const replyTarget = ref<FileComment | null>(null)
const replyContent = ref('')
const replySubmitting = ref(false)

const reportVisible = ref(false)
const reportTarget = ref<FileComment | null>(null)
const reportType = ref('')
const reportContent = ref('')
const reportAnonymous = ref(false)
const reportSubmitting = ref(false)

const reportReasons = computed(() => [
  {
    value: '传播虚假信息',
    label: t('comments.reasons.falseInformation'),
  },
  {
    value: '涉及侵权',
    label: t('comments.reasons.infringement'),
  },
  {
    value: '色情低俗',
    label: t('comments.reasons.explicit'),
  },
  {
    value: '泄露隐私',
    label: t('comments.reasons.privacy'),
  },
  {
    value: '涉及政治宗教',
    label: t('comments.reasons.politicsReligion'),
  },
  {
    value: '涉及反动',
    label: t('comments.reasons.illegalPolitics'),
  },
  {
    value: '散布赌博，暴力等',
    label: t('comments.reasons.gamblingViolence'),
  },
  {
    value: '其他违规行为',
    label: t('comments.reasons.other'),
  },
])

const replyTitle = computed(() =>
  t('comments.replyTitle', {
    name:
      replyTarget.value?.userName || t('comments.unknownUser'),
  }),
)

function getErrorMessage(error: any, fallback: string) {
  const message = error?.response?.data?.msg

  if (typeof message === 'string') return message
  if (Array.isArray(message)) return message.join('\n')
  if (typeof error?.message === 'string') return error.message

  return fallback
}

async function loadCurrentUser() {
  try {
    loggedIn.value = await getIsLogin()

    currentUser.value = loggedIn.value
      ? await getUserNameAndId()
      : null
  } catch {
    loggedIn.value = false
    currentUser.value = null
  }
}

async function loadComments(page = 1) {
  if (!props.fileId) return

  loading.value = true
  commentsError.value = false

  try {
    const result = await getFileComments(
      props.fileId,
      page,
      pageSize,
    )

    comments.value = result.list || []
    total.value = result.total || 0
    pageNum.value = page

    for (const key of Object.keys(replyStates)) {
      delete replyStates[key]
    }
    for (const key of Object.keys(expandedReplies)) {
      delete expandedReplies[key]
    }
  } catch (error: any) {
    commentsError.value = true
    showFailToast({
      message: getErrorMessage(
        error,
        t('comments.loadFailed'),
      ),
      duration: 2500,
    })
  } finally {
    loading.value = false
  }
}

async function ensureAuthenticated() {
  if (!loggedIn.value || !currentUser.value) {
    showFailToast(t('comments.loginRequired'))
    await router.push({
      path: '/login',
      query: {
        redirect: route.fullPath,
      },
    })
    return false
  }

  return true
}

async function submitTopLevelComment() {
  if (submitting.value) return

  const content = newComment.value.trim()

  if (!content || !(await ensureAuthenticated())) return

  submitting.value = true

  try {
    await addComment({
      _id: props.fileId,
      content,
      firstCommentId: null,
      toUserId: null,
      hasChildren: true,
    })

    newComment.value = ''
    showSuccessToast(t('comments.publishSuccess'))
    await loadComments(1)
  } catch (error: any) {
    showFailToast({
      message: getErrorMessage(
        error,
        t('comments.publishFailed'),
      ),
      duration: 2500,
    })
  } finally {
    submitting.value = false
  }
}

async function loadReplies(firstCommentId: string) {
  replyStates[firstCommentId] = {
    ...(replyStates[firstCommentId] || {
      loaded: false,
      items: [],
    }),
    loading: true,
  }

  try {
    const items = await getCommentReplies(
      props.fileId,
      firstCommentId,
    )

    replyStates[firstCommentId] = {
      loading: false,
      loaded: true,
      items: items || [],
    }
  } catch (error: any) {
    replyStates[firstCommentId] = {
      loading: false,
      loaded: false,
      items: replyStates[firstCommentId]?.items || [],
    }

    showFailToast({
      message: getErrorMessage(
        error,
        t('comments.repliesLoadFailed'),
      ),
      duration: 2500,
    })
  }
}

async function toggleReplies(comment: FileComment) {
  const rootId = comment.commentId
  const state = replyStates[rootId]

  if (!state?.loaded) {
    await loadReplies(rootId)
    expandedReplies[rootId] = true
    return
  }

  expandedReplies[rootId] = !expandedReplies[rootId]
}

async function openReply(comment: FileComment) {
  if (!(await ensureAuthenticated())) return

  replyTarget.value = comment
  replyContent.value = ''
  replyVisible.value = true
}

function closeReply() {
  replyVisible.value = false
  replyTarget.value = null
  replyContent.value = ''
}

async function submitReply() {
  if (replySubmitting.value) return

  const target = replyTarget.value
  const content = replyContent.value.trim()

  if (!target || !content) return

  const rootId = target.firstCommentId || target.commentId
  replySubmitting.value = true

  try {
    await addComment({
      _id: props.fileId,
      content,
      firstCommentId: rootId,
      toUserId: target.userName || '',
      hasChildren: false,
    })

    closeReply()
    showSuccessToast(t('comments.replySuccess'))
    await loadReplies(rootId)
    expandedReplies[rootId] = true
  } catch (error: any) {
    showFailToast({
      message: getErrorMessage(
        error,
        t('comments.replyFailed'),
      ),
      duration: 2500,
    })
  } finally {
    replySubmitting.value = false
  }
}

async function removeComment(comment: FileComment) {
  if (!(await ensureAuthenticated())) return

  try {
    await showConfirmDialog({
      title: t('comments.deleteConfirmTitle'),
      message: t('comments.deleteConfirmMessage'),
      confirmButtonText: t('comments.delete'),
      cancelButtonText: t('common.cancel'),
    })
  } catch {
    return
  }

  try {
    await deleteComment({
      _id: props.fileId,
      userId: currentUser.value?.userId || '',
      commentId: comment.commentId,
      firstCommentId: comment.firstCommentId || null,
    })

    const rootId = comment.firstCommentId

    showSuccessToast(t('comments.deleteSuccess'))
    await loadComments(pageNum.value)

    if (rootId) {
      await loadReplies(rootId)
      expandedReplies[rootId] = true
    }
  } catch (error: any) {
    showFailToast({
      message: getErrorMessage(
        error,
        t('comments.deleteFailed'),
      ),
      duration: 2500,
    })
  }
}

async function openReport(comment: FileComment) {
  if (!(await ensureAuthenticated())) return

  reportTarget.value = comment
  reportType.value = reportReasons.value[0]?.value || ''
  reportContent.value = t('comments.defaultReportContent')
  reportAnonymous.value = false
  reportVisible.value = true
}

function closeReport() {
  reportVisible.value = false
  reportTarget.value = null
  reportType.value = ''
  reportContent.value = ''
  reportAnonymous.value = false
}

async function submitReport() {
  if (reportSubmitting.value) return

  const target = reportTarget.value
  const content = reportContent.value.trim()

  if (!target || !reportType.value || content.length < 10) {
    return
  }

  reportSubmitting.value = true

  try {
    await reportComment({
      objectId: target.userId,
      commentId: target.commentId,
      _id: props.fileId,
      reportContent: content,
      type: reportType.value,
      anon: reportAnonymous.value,
    })

    const rootId = target.firstCommentId

    closeReport()
    showSuccessToast(t('comments.reportSuccess'))
    await loadComments(pageNum.value)

    if (rootId) {
      await loadReplies(rootId)
      expandedReplies[rootId] = true
    }
  } catch (error: any) {
    showFailToast({
      message: getErrorMessage(
        error,
        t('comments.reportFailed'),
      ),
      duration: 2500,
    })
  } finally {
    reportSubmitting.value = false
  }
}

function isOwnComment(comment: FileComment) {
  return Boolean(
    currentUser.value?.userId &&
      comment.userId === currentUser.value.userId,
  )
}

function avatarUrl(userId: string) {
  return `https://api.quickysharing.cn/user/avatar?userId=${encodeURIComponent(userId)}`
}

function formatCommentTime(value?: string) {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }

  return date.toLocaleDateString()
}

function sentimentText(value?: number | null) {
  if (value === 1) return t('comments.positive')
  if (value === 0) return t('comments.negative')
  return ''
}

watch(
  () => props.fileId,
  async (value, previous) => {
    if (!value || value === previous) return

    closeReply()
    closeReport()
    newComment.value = ''
    pageNum.value = 1
    await loadComments(1)
  },
)

onMounted(async () => {
  await Promise.all([
    loadComments(1),
    loadCurrentUser(),
  ])
})
</script>

<style scoped>
.comments-card {
  margin-top: 12px;
  overflow: hidden;
  background: #fff;
}

.comments-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.comments-title {
  color: #323233;
  font-size: 17px;
  font-weight: 600;
}

.comments-count {
  color: #969799;
  font-size: 13px;
}

.comment-composer {
  margin: 0 12px 12px;
  padding: 10px;
  border-radius: 8px;
  background: #f7f8fa;
}

.comment-composer :deep(.van-field) {
  padding: 0;
  background: transparent;
}

.comment-composer :deep(.van-field::after) {
  display: none;
}

.composer-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.comments-loading {
  display: flex;
  justify-content: center;
  padding: 36px 0;
}

.comment-item,
.reply-item {
  display: flex;
  gap: 10px;
}

.comment-item {
  padding: 14px 14px 16px;
  border-top: 1px solid #f2f3f5;
}

.reply-item {
  padding: 10px 0;
  border-top: 1px solid #f2f3f5;
}

.comment-avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 50%;
  background: #f2f3f5;
  object-fit: cover;
}

.reply-avatar {
  width: 30px;
  height: 30px;
  flex-basis: 30px;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-meta,
.comment-author-row,
.comment-footer,
.comment-actions {
  display: flex;
  align-items: center;
}

.comment-meta {
  justify-content: space-between;
  gap: 8px;
}

.comment-author-row {
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.comment-author {
  color: #323233;
  font-size: 14px;
  font-weight: 600;
}

.reply-target {
  color: #1989fa;
  font-size: 12px;
}

.comment-time {
  flex-shrink: 0;
  color: #969799;
  font-size: 12px;
}

.comment-content {
  margin-top: 7px;
  color: #323233;
  font-size: 14px;
  line-height: 21px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.comment-footer {
  justify-content: space-between;
  gap: 10px;
  margin-top: 9px;
}

.comment-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.comment-actions :deep(.van-button) {
  min-width: 42px;
}

.reply-toggle {
  margin-top: 9px;
  padding: 0;
}

.reply-list {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f7f8fa;
}

.comments-pagination {
  padding: 14px 10px 16px;
}

.editor-panel {
  max-height: 88vh;
  overflow-y: auto;
  padding: 20px 16px calc(16px + env(safe-area-inset-bottom));
}

.editor-panel h3 {
  margin: 0 36px 14px 0;
  color: #323233;
  font-size: 17px;
}

.editor-panel :deep(.van-field) {
  padding: 10px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
}

.editor-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
}

.report-context {
  margin: -4px 0 14px;
  color: #969799;
  font-size: 13px;
}

.report-label {
  margin-bottom: 10px;
  color: #323233;
  font-size: 14px;
  font-weight: 600;
}

.report-reason {
  margin-bottom: 12px;
}

.report-content {
  margin-top: 14px;
}

.report-panel :deep(.van-cell) {
  margin-top: 10px;
  padding-right: 0;
  padding-left: 0;
}
</style>
