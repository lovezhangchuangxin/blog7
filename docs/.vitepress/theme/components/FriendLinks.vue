<template>
  <div class="friend-links">
    <div class="friend-card" v-for="friend in friends" :key="friend.url">
      <a :href="friend.url" target="_blank" rel="noopener noreferrer">
        <img
          class="friend-avatar"
          :src="friend.avatar"
          :alt="friend.name + ' avatar'"
        />
        <div class="friend-info">
          <div class="friend-name">{{ friend.name }}</div>
          <div class="friend-desc">{{ friend.desc }}</div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
const friends = [];
</script>

<style scoped>
.friend-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 32px 0;
}

@media (max-width: 1500px) {
  .friend-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .friend-links {
    grid-template-columns: 1fr;
  }
}

.friend-card {
  background: var(--vp-code-block-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  width: 100%;
  min-width: 0;
}
.friend-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.12);
}
.friend-card a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  padding: 18px 20px;
}
.friend-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 18px;
  border: 2px solid #eee;
  background: #fff;
}
.friend-info {
  flex: 1;
  min-width: 0;
}
.friend-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.friend-desc {
  font-size: 0.95rem;
  color: #888;
  line-height: 1.4;
  word-break: break-all;
}
</style>
