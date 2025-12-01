import cloudbase from '@cloudbase/js-sdk';

// 云开发环境 ID
const ENV_ID = 'cloud1-5g39elugeec5ba0f';

// 初始化云开发
const app = cloudbase.init({
  env: ENV_ID,
});

export const auth = app.auth();
export const db = app.database();

// 数据库集合
export const activitiesCollection = db.collection('lottery_activities');
export const participantsCollection = db.collection('lottery_participants');
export const winnersCollection = db.collection('lottery_winners');

// 数据库命令
export const _ = db.command;

export default app;
