// config.json 로드 및 포트폴리오 렌더링
let portfolioData = {};

// config.json 로드
async function loadConfig() {
    try {
        const response = await fetch('config.json?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        portfolioData = await response.json();
        console.log('포트폴리오 데이터 로드 완료:', portfolioData);
        renderPortfolio();
    } catch (error) {
        console.error('config.json을 불러오는 중 오류가 발생했습니다:', error);
        // 오류 메시지를 화면에 표시
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #1e293b; background: #ffffff; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <h1 style="color: #2563eb; margin-bottom: 1rem;">오류 발생</h1>
                <p style="color: #475569; margin-bottom: 0.5rem;">config.json 파일을 불러올 수 없습니다.</p>
                <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1rem;">${error.message}</p>
                <p style="margin-top: 1rem; color: #64748b;">로컬 서버를 실행하고 http://localhost:8000으로 접속해주세요.</p>
                <p style="margin-top: 0.5rem; color: #64748b; font-size: 0.9rem;">또는 파일을 직접 열면 CORS 오류가 발생할 수 있습니다.</p>
            </div>
        `;
    }
}

// 프로필 이미지 렌더링
function renderProfileImage() {
    const profileImage = document.getElementById('profileImage');
    if (portfolioData.profile.photo) {
        const img = document.createElement('img');
        img.src = portfolioData.profile.photo;
        img.alt = portfolioData.profile.name;
        profileImage.appendChild(img);
    } else {
        // 초기 이니셜 표시 (한국어 이름 지원)
        const name = portfolioData.profile.name;
        let initials = '';
        if (name.length >= 2) {
            // 한국어 이름의 경우 첫 글자와 마지막 글자 사용
            initials = name[0] + name[name.length - 1];
        } else {
            initials = name[0] || '?';
        }
        profileImage.textContent = initials;
    }
}

// 소셜 링크 렌더링
function renderSocialLinks() {
    const socialLinks = document.getElementById('socialLinks');
    const social = portfolioData.profile.social;
    
    const socialIcons = {
        github: '🔗',
        linkedin: '💼',
        blog: '📝'
    };
    
    Object.keys(social).forEach(key => {
        if (social[key]) {
            const link = document.createElement('a');
            link.href = social[key];
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = key;
            link.textContent = socialIcons[key] || '🔗';
            socialLinks.appendChild(link);
        }
    });
}

// 네비게이션 메뉴 렌더링
function renderNavMenu() {
    const navMenu = document.getElementById('navMenu');
    const sections = portfolioData.sections || [];
    
    const sectionNames = {
        profile: '프로필',
        desiredPosition: '희망직무',
        qualifications: '자격사항',
        experience: '경력',
        education: '학력',
        projects: '프로젝트'
    };
    
    sections.forEach(sectionId => {
        if (sectionId === 'profile') return; // 프로필은 네비게이션에서 제외
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${sectionId}`;
        a.textContent = sectionNames[sectionId] || sectionId;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        });
        li.appendChild(a);
        navMenu.appendChild(li);
    });
}

// 희망직무 섹션 렌더링
function renderDesiredPosition() {
    const container = document.getElementById('desiredPositionContent');
    if (!portfolioData.desiredPosition) return;
    
    const { title, description, focus } = portfolioData.desiredPosition;
    
    let html = `<h3 style="font-size: 1.8rem; margin-bottom: 1rem; color: var(--text-primary);">${title || ''}</h3>`;
    
    if (focus) {
        html += `<p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 1rem;">
            <strong>관심 분야:</strong> ${focus}
        </p>`;
    }
    
    if (description) {
        html += `<p style="color: var(--text-secondary); line-height: 1.8;">${description}</p>`;
    }
    
    container.innerHTML = html;
}

// 자격사항 섹션 렌더링
function renderQualifications() {
    const container = document.getElementById('qualificationsContent');
    console.log('자격사항 데이터:', portfolioData.qualifications);
    if (!portfolioData.qualifications || portfolioData.qualifications.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">자격사항 정보를 추가해주세요.</p>';
        return;
    }
    
    container.innerHTML = portfolioData.qualifications.map(qual => `
        <div class="qualification-card">
            <div class="qualification-name">${qual.name || ''}</div>
            ${qual.issuer ? `<div class="qualification-issuer">${qual.issuer}</div>` : ''}
            ${qual.date ? `<div class="qualification-date">취득일: ${qual.date}</div>` : ''}
            ${qual.number ? `<div class="qualification-date">자격번호: ${qual.number}</div>` : ''}
        </div>
    `).join('');
}

// 경력 섹션 렌더링
function renderExperience() {
    const container = document.getElementById('experienceContent');
    if (!portfolioData.experience || portfolioData.experience.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">경력 정보를 추가해주세요.</p>';
        return;
    }
    
    container.innerHTML = portfolioData.experience.map(exp => `
        <div class="experience-item">
            <div class="experience-company">${exp.company || ''}</div>
            ${exp.position ? `<div class="experience-position">${exp.position}</div>` : ''}
            ${exp.period ? `<div class="experience-period">${exp.period}</div>` : ''}
            ${exp.description ? `<div class="experience-description">${exp.description}</div>` : ''}
        </div>
    `).join('');
}

// 학력 섹션 렌더링
function renderEducation() {
    const container = document.getElementById('educationContent');
    if (!portfolioData.education || portfolioData.education.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">학력 정보를 추가해주세요.</p>';
        return;
    }
    
    container.innerHTML = portfolioData.education.map(edu => `
        <div class="education-item">
            <div class="education-school">${edu.school || ''}</div>
            ${edu.major ? `<div class="education-major">${edu.major}</div>` : ''}
            ${edu.degree ? `<div class="education-degree">${edu.degree}</div>` : ''}
            ${edu.period ? `<div class="education-period">${edu.period}</div>` : ''}
            ${edu.gpa ? `<div class="education-period">GPA: ${edu.gpa}</div>` : ''}
        </div>
    `).join('');
}

// 프로젝트 섹션 렌더링
function renderProjects() {
    const container = document.getElementById('projectsContent');
    console.log('프로젝트 데이터:', portfolioData.projects);
    console.log('프로젝트 개수:', portfolioData.projects ? portfolioData.projects.length : 0);
    if (!portfolioData.projects || portfolioData.projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">프로젝트 정보를 추가해주세요.</p>';
        return;
    }
    
    container.innerHTML = portfolioData.projects.map((project, index) => `
        <div class="project-wrapper">
            <div class="project-card">
                <div class="project-title">${project.title || ''}</div>
                ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
                ${project.tech && project.tech.length > 0 ? `
                    <div class="project-tech">
                        ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="project-actions">
                    ${project.pdf ? `
                        <button class="btn btn-primary" onclick="openPdfModal('${project.pdf}', '${project.title || ''}')">
                            👁️ PDF 미리보기
                        </button>
                        <a href="${project.pdf}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                            📄 새 탭에서 보기
                        </a>
                        <a href="${project.pdf}" class="btn btn-secondary" download>
                            📥 PDF 다운로드
                        </a>
                    ` : ''}
                ${project.github ? `
                    <a href="${project.github}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                        🔗 GitHub
                    </a>
                ` : ''}
                ${project.demo ? `
                    <a href="${project.demo}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                        🌐 데모
                    </a>
                ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// PDF 모달 열기 함수
function openPdfModal(pdfUrl, title) {
    // 모달이 없으면 생성
    let modal = document.getElementById('pdfModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pdfModal';
        modal.className = 'pdf-modal';
        modal.innerHTML = `
            <div class="pdf-modal-content">
                <div class="pdf-modal-header">
                    <h2 id="pdfModalTitle">PDF 미리보기</h2>
                    <button class="pdf-modal-close" onclick="closePdfModal()">✕</button>
                </div>
                <div class="pdf-modal-body">
                    <iframe id="pdfModalFrame" src="" frameborder="0"></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 모달 배경 클릭 시 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closePdfModal();
            }
        });
    }
    
    // 모달 내용 업데이트
    document.getElementById('pdfModalTitle').textContent = title || 'PDF 미리보기';
    document.getElementById('pdfModalFrame').src = pdfUrl;
    
    // 모달 표시
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// PDF 모달 닫기 함수
function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('pdfModalFrame').src = '';
        document.body.style.overflow = '';
    }
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePdfModal();
    }
});

// 전역 함수로 등록
window.openPdfModal = openPdfModal;
window.closePdfModal = closePdfModal;

// 섹션 가시성 체크 및 애니메이션
function checkSectionVisibility() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// 포트폴리오 전체 렌더링
function renderPortfolio() {
    // 프로필 정보
    document.getElementById('heroName').textContent = portfolioData.profile.name;
    document.getElementById('heroTitle').textContent = portfolioData.profile.title || '';
    const bioElement = document.getElementById('heroBio');
    console.log('자기소개 데이터:', portfolioData.profile.bio);
    if (portfolioData.profile.bio) {
        // 줄바꿈 처리 (이중 줄바꿈은 단락 구분, 단일 줄바꿈은 <br>로)
        const bioText = portfolioData.profile.bio;
        const paragraphs = bioText.split(/\n\n/).map(p => p.trim()).filter(p => p);
        if (paragraphs.length > 1) {
            // 여러 단락인 경우
            bioElement.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 1rem;">${p.replace(/\n/g, '<br>')}</p>`).join('');
        } else if (paragraphs.length === 1) {
            // 단일 단락인 경우
            bioElement.innerHTML = paragraphs[0].replace(/\n/g, '<br>');
        }
    } else {
        bioElement.textContent = '';
    }
    
    renderProfileImage();
    renderSocialLinks();
    renderNavMenu();
    
    // 섹션별 렌더링 (순서대로)
    if (portfolioData.sections.includes('education')) {
        renderEducation();
    }
    
    if (portfolioData.sections.includes('experience')) {
        renderExperience();
    }
    
    if (portfolioData.sections.includes('qualifications')) {
        renderQualifications();
    }
    
    if (portfolioData.sections.includes('desiredPosition')) {
        renderDesiredPosition();
    }
    
    if (portfolioData.sections.includes('projects')) {
        renderProjects();
    }
    
    // 섹션 가시성 체크 시작
    setTimeout(() => {
        checkSectionVisibility();
    }, 100);
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
});

