import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Brand } from '@/shared/components/layout/Brand';
import { BookOpen, Mail, MessageCircle, Heart } from 'lucide-react';

export function AppFooter() {
  useTextLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo" aria-label="HolaVietnamese footer">
      {/* Decorative Golden Accent Line */}
      <div className="site-footer__accent-bar" aria-hidden="true" />

      <div className="site-footer__inner">
        {/* Brand & Mission column */}
        <div className="site-footer__about">
          <Brand className="site-footer__brand" />
          <p className="site-footer__tagline">
            <BilingualText
              vi="Nền tảng học tiếng Việt tương tác số 1 dành cho người nước ngoài, kiều bào và người yêu văn hóa Việt Nam toàn cầu."
              en="The premier interactive Vietnamese learning platform for foreigners, diaspora, and culture lovers worldwide."
            />
          </p>

          <div className="site-footer__badges">
            <span className="site-footer__pill-badge">
              <span>English · Tiếng Việt</span>
            </span>
            <span className="site-footer__pill-badge">
              <span>EdTech for Vietnam</span>
            </span>
          </div>

          <div className="site-footer__social" aria-label="HolaVietnamese channels">
            <Link to="/blog" aria-label="Stories and Blog" title={bilingualLabel("Học viên chia sẻ & Blog", "Learner Stories & Blog")}>
              <BookOpen size={16} />
            </Link>
            <Link to="/ai-scenarios" aria-label="Conversation Scenarios" title={bilingualLabel("Luyện hội thoại & Cộng đồng", "Conversation Practice & Community")}>
              <MessageCircle size={16} />
            </Link>
            <a href="mailto:support@holavietnamese.com" aria-label="Email support" title={bilingualLabel("Hỗ trợ qua Email", "Email Support")}>
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Navigation Column 1: Khám phá */}
        <nav className="site-footer__column" aria-label={bilingualLabel("Khám phá", "Explore")}>
          <strong><BilingualText vi="Khám phá" en="Explore" /></strong>
          <Link to="/courses"><BilingualText vi="Khóa học toàn diện" en="All Courses" /></Link>
          <Link to="/explore"><BilingualText vi="Hành trình di sản" en="Destinations" /></Link>
          <Link to="/culture"><BilingualText vi="Văn hóa Việt Nam" en="Vietnamese Culture" /></Link>
          <Link to="/blog"><BilingualText vi="Blog & Góc nhìn" en="Stories & Blog" /></Link>
        </nav>

        {/* Navigation Column 2: Kỹ năng & Công cụ */}
        <nav className="site-footer__column" aria-label={bilingualLabel("Tài nguyên học tập", "Learning Resources")}>
          <strong><BilingualText vi="Kỹ năng & Công cụ" en="Skills & Tools" /></strong>
          <Link to={ROUTES.ALPHABET}><BilingualText vi="Bảng chữ cái & Âm điệu" en="Alphabet & Tones" /></Link>
          <Link to={ROUTES.VOCABULARY}><BilingualText vi="Kho từ vựng SRS" en="Vocabulary SRS" /></Link>
          <Link to="/ai-tutor"><BilingualText vi="AI Gia sư 24/7" en="AI Tutor 24/7" /></Link>
          <Link to="/ai-scenarios"><BilingualText vi="Luyện hội thoại thực tế" en="Real-life Scenarios" /></Link>
        </nav>

        {/* Navigation Column 3: Dành cho học viên */}
        <nav className="site-footer__column" aria-label={bilingualLabel("Dành cho học viên", "For Learners")}>
          <strong><BilingualText vi="Dành cho học viên" en="For Learners" /></strong>
          <Link to="/my-learning"><BilingualText vi="Góc học tập cá nhân" en="My Learning" /></Link>
          <Link to="/achievements"><BilingualText vi="Bảng thành tích & Huy hiệu" en="Achievements" /></Link>
          <Link to="/progress"><BilingualText vi="Tiến độ học tập" en="Learning Progress" /></Link>
          <Link to="/welcome"><BilingualText vi="Lộ trình trải nghiệm" en="Experience Flow" /></Link>
        </nav>

        {/* Navigation Column 4: Hỗ trợ & Điều khoản */}
        <nav className="site-footer__column" aria-label={bilingualLabel("Hỗ trợ & Pháp lý", "Support & Legal")}>
          <strong><BilingualText vi="Hỗ trợ & Pháp lý" en="Help & Legal" /></strong>
          <a href="mailto:support@holavietnamese.com"><BilingualText vi="Liên hệ hỗ trợ" en="Contact Support" /></a>
          <Link to="/settings"><BilingualText vi="Cài đặt học tập" en="Learning Settings" /></Link>
          <Link to="/login"><BilingualText vi="Điều khoản dịch vụ" en="Terms of Service" /></Link>
          <Link to="/register"><BilingualText vi="Chính sách bảo mật" en="Privacy Policy" /></Link>
        </nav>
      </div>

      {/* Bottom Bar: Copyright & Accreditation */}
      <div className="site-footer__bottom">
        <div className="site-footer__copyright">
          <span>© {currentYear} HolaVietnamese Inc.</span>
          <span className="site-footer__sep" aria-hidden="true">·</span>
          <span><BilingualText vi="Bản quyền đã được bảo lưu." en="All rights reserved." /></span>
        </div>

        <div className="site-footer__dedication">
          <Heart size={13} className="text-red-400 inline mr-1.5" aria-hidden="true" />
          <span>
            <BilingualText
              vi="Được thiết kế cho người học tiếng Việt toàn cầu."
              en="Crafted for Vietnamese language learners worldwide."
            />
          </span>
        </div>

        <div className="site-footer__legal-links">
          <Link to="/login"><BilingualText vi="Điều khoản" en="Terms" /></Link>
          <span className="site-footer__sep" aria-hidden="true">·</span>
          <Link to="/register"><BilingualText vi="Bảo mật" en="Privacy" /></Link>
          <span className="site-footer__sep" aria-hidden="true">·</span>
          <a href="mailto:support@holavietnamese.com"><BilingualText vi="Trợ giúp" en="Help" /></a>
        </div>
      </div>
    </footer>
  );
}
