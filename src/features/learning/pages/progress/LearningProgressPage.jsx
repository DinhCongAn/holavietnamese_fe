import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { learnerService } from '@/features/learning/api/learnerService';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { PageHeader, EmptyState } from '@/shared/components/common/Ui';
import { ProgressBar } from '@/shared/components/common/ProgressBar';
import { formatRelativeTime } from '@/constants/notifications';

export function LearningProgressPage() {
  const resource = useAsyncResource(useCallback(() => learnerService.getProgressData(), []));
  return <section><PageHeader eyebrow={<BilingualText vi="Từng bước nhỏ đều có ý nghĩa" en="Every small step counts" />} title={<BilingualText vi="Tiến độ học tập" en="Learning Progress" />} description={<BilingualText vi="Nhìn lại những điều bạn đã học và tìm nhịp học của riêng mình." en="Look back at what you've learned and discover your own study rhythm." />}/>
    <ResourceState resource={resource}>{data => {
      const streak = data?.streakCount ?? data?.currentStreak ?? 0;
      const completed = data?.completedLessonsCount ?? data?.completedLessons ?? 0;
      const vocab = data?.learnedVocabulariesCount ?? data?.masteredWords ?? 0;
      const xp = data?.totalXp ?? 0;
      const goal = data?.dailyGoalMinutes || 15, today = data?.todayMinutes || 10;
      const transactions = data?.recentXpTransactions || data?.recentActivities || [];
      const weekly = data?.weeklyActivity || [];
      const max = Math.max(...weekly.map(day => Number(day.minutes ?? day.value ?? 0)), goal);
      return <>
        <div className="progress-kpis">{[['Thời gian học',data.totalTimeMinutes != null ? `${data.totalTimeMinutes} phút` : '—'],['Bài học hoàn thành',`${completed} bài`],['Từ vựng đã thuộc',`${vocab} từ`],['Chuỗi liên tục',`${streak} ngày`],['Điểm kinh nghiệm',`${xp} XP`]].map(([label,value]) => <div className="account-kpi" key={label}><span><BilingualText>{label}</BilingualText></span><strong>{value}</strong></div>)}</div>
        <div className="progress-panels">
          <section className="card"><h2><BilingualText>{"Nhịp học trong tuần"}</BilingualText></h2><p className="muted"><BilingualText>{"Một chút mỗi ngày, một chặng đường dài."}</BilingualText></p>{weekly.length ? <div className="weekly-chart">{weekly.map((day,index) => <div key={index}><span>{day.minutes ?? day.value ?? 0}<BilingualText>{"phút"}</BilingualText></span><i style={{height:`${Math.max(4,Number(day.minutes ?? day.value ?? 0)/max*140)}px`}}/><small>{day.day || day.label || day.date}</small></div>)}</div> : <EmptyState title={bilingualLabel("Chưa có dữ liệu học trong tuần", "No study data this week")}/>}</section>
          <section className="card"><h2><BilingualText>{"Mục tiêu hôm nay"}</BilingualText></h2><strong className="daily-minutes">{today}<small> / {goal}<BilingualText>{"phút"}</BilingualText></small></strong><ProgressBar value={Math.min(100,Math.round(today/goal*100))} label="Mục tiêu mỗi ngày"/><p className="muted"><BilingualText>{today >= goal ? 'Bạn đã hoàn thành mục tiêu hôm nay.' : `Thêm ${Math.max(0,goal-today)} phút cho hành trình của bạn.`}</BilingualText></p><Link className="text-link" to="/courses"><BilingualText>{"Tiếp tục học →"}</BilingualText></Link></section>
          <section className="card"><h2><BilingualText>{"Tiến độ khóa học"}</BilingualText></h2>{data.enrolledCourses?.length ? data.enrolledCourses.map(course => <div className="progress-course" key={course.id}><Link to={`/courses/${course.id}`}><BilingualText vi={course.titleVi || course.title} en={course.title} /></Link><ProgressBar value={course.progress} label="Hoàn thành"/></div>) : <EmptyState title={bilingualLabel("Bắt đầu khóa học đầu tiên", "Start your first course")}><Link className="text-link" to="/courses"><BilingualText>{"Khám phá khóa học →"}</BilingualText></Link></EmptyState>}</section>
          <section className="card"><h2><BilingualText>{"Hoạt động gần đây"}</BilingualText></h2>{transactions.length ? transactions.map((item,index) => <div className="account-list-row" key={item.id ?? index}><div><strong>{item.title || item.description || item.reason || <BilingualText>Hoạt động học tập</BilingualText>}</strong><small>{item.time || (item.createdAt ? formatRelativeTime(item.createdAt, 'vi') : null) || item.transactionDate || <BilingualText>Gần đây</BilingualText>}</small></div><b>{item.amount ?? item.xp ?? 0} XP</b></div>) : <EmptyState title={bilingualLabel("Chưa có giao dịch XP gần đây", "No recent XP transactions")}/>}</section>
        </div>
      </>;
    }}</ResourceState>
  </section>;
}
