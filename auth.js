// 로컬스토리지 키
const USERS_KEY = "todoUsers";

// 저장된 유저 가져오기
function loadUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

// 저장
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 이메일 유효성 검사
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 회원가입
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  if (!registerForm) return; // 안전하게 null 체크

  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!email.includes('@')) {
      alert('유효한 이메일을 입력해주세요.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('todoUsers') || '[]');
    if (users.some(u => u.email === email)) {
      alert('이미 가입된 이메일입니다.');
      return;
    }

    users.push({ email, password });
    localStorage.setItem('todoUsers', JSON.stringify(users));
    alert('회원가입 성공! 로그인 페이지로 이동합니다.');
    window.location.href = 'login.html';
  });
});




// 로그인 성공 시 이메일 저장
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const users = JSON.parse(localStorage.getItem('todoUsers') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    return;
  }

  localStorage.setItem('loggedUser', email); // 투두리스트에서 확인용
  alert(`${email}님 로그인 성공!`);
  window.location.href = 'index.html';
});
