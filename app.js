/***********************
  LOCAL STORAGE
************************/
const STORAGE_KEY = "todoData_final";

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/***********************
  DOM 요소
************************/
const listWrapper = document.getElementById("listWrapper");
const addListContentBtn = document.getElementById("addListContentBtn");
const sortSelect = document.getElementById("sortSelect");
const categoryFilter = document.getElementById("categoryFilter");
const newCategoryInput = document.getElementById("newCategoryInput");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const saveBackupBtn = document.getElementById("saveBackup");

/***********************
  기본 카테고리
************************/
let categories = ["공부", "운동", "집안일", "약속", "기타"];

/***********************
  화면 렌더링
************************/
function render(inputData = null) {
  listWrapper.innerHTML = "";
  const data = inputData ?? loadData(); // null 병합 연산자로 처리

  data.forEach(list => {
    const card = document.createElement("section");
    card.className = "listContent";
    card.dataset.id = list.id;

    // 제목
    const titleBox = document.createElement("h1");
    titleBox.className = "listTitle";
    titleBox.innerHTML = `
      <div>📌</div>
      <div class="titleText" contenteditable="false">${list.title}</div>
      <div class="modify_button">...</div>
      <div class="del_button delList">X</div>
    `;
    card.appendChild(titleBox);

    // 할일 목록
    list.todos.forEach(todo => {
      card.appendChild(createTodoElement(todo));
    });

    // 새 할일 버튼
    const addTodoBtn = document.createElement("button");
    addTodoBtn.textContent = "+ 새 할일";
    addTodoBtn.className = "addTodoBtn";
    addTodoBtn.addEventListener("click", () => {
      const newTodo = {
        id: Date.now(),
        category: categories[0],
        text: "새 항목",
        done: false,
        delPending: false
      };
      list.todos.push(newTodo);
      render(data); // 기존 data 그대로 렌더
      activateSave(card);
    });
    card.appendChild(addTodoBtn);

    // 저장 안내
    const note = document.createElement("div");
    note.className = "save-note";
    note.textContent = "*저장해야 반영됩니다*";
    card.appendChild(note);

    const saveBtn = document.createElement("div");
    saveBtn.className = "save-btn disabled";
    saveBtn.textContent = "저장";
    card.appendChild(saveBtn);

    listWrapper.appendChild(card);
  });

  // 리스트 생성 버튼 항상 마지막에 추가
  listWrapper.appendChild(addListContentBtn); 

  renderCategoryFilter();
  return data; // **중요**: 정렬 등 후에도 data를 반환
}


/***********************
  todolist element 생성 함수
************************/
function createTodoElement(todo) {
  const art = document.createElement("article");
  art.className = "todolist";
  art.dataset.id = todo.id;

  art.innerHTML = `
    <div class="topPanel">
      <select class="category"></select>
      <div class="del_button delTodo ${todo.delPending ? "pending" : ""}">X</div>
    </div>
    <div class="bottomPanel">
      <div class="content_area" contenteditable="true">${todo.text}</div>
      <input type="checkbox" class="check" ${todo.done ? "checked" : ""}/>
    </div>
  `;

  const select = art.querySelector(".category");
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === todo.category) opt.selected = true;
    select.appendChild(opt);
  });

  return art;
}

/***********************
  카테고리 필터 렌더링
************************/
function renderCategoryFilter() {
  categoryFilter.innerHTML = `<option value="all">전체</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

function sortData(data) {
  const mode = sortSelect.value;

  if (mode === "latest") {
    return data.sort((a, b) => b.id - a.id);
  } else if (mode === "input") {
    return data.sort((a, b) => a.id - b.id);
  } else if (mode === "priority") {
    return data.sort((a, b) => {
      const aPending = a.todos.filter(t => !t.done).length;
      const bPending = b.todos.filter(t => !t.done).length;
      return bPending - aPending;
    });
  }
  return data;
}

// 정렬 후 렌더링
function renderSorted(inputData = null) {
  const data = inputData ?? loadData();
  const sortedData = sortData([...data]); // 원본 데이터 훼손 방지  

  return render(sortedData);
}


/***********************
  저장버튼 활성화
************************/
function activateSave(card) {
  card.querySelector(".save-note").classList.add("active");
  card.querySelector(".save-btn").classList.remove("disabled");
}

/***********************
  투두리스트 생성버튼
************************/

const addListBtn = document.getElementById("addListContentBtn");

/***********************
  이벤트 위임
************************/
listWrapper.addEventListener("wheel", (e) => {
  e.preventDefault();

  // 현재 렌더된 첫 번째 listContent 가져오기
  const firstCard = listWrapper.querySelector('.listContent');
  if (!firstCard) return;

  const scrollAmount = firstCard.offsetWidth * 2; // 폭 * 2
  const direction = e.deltaY > 0 ? 1 : -1;

  listWrapper.scrollBy({
    left: scrollAmount * direction,
    behavior: "smooth"
  });
});
// 터치 드래그 가로 스크롤 (카드 폭 * 2 단위)
let isTouching = false;
let startX = 0;
let scrollLeft = 0;

listWrapper.addEventListener("touchstart", (e) => {
  isTouching = true;
  startX = e.touches[0].pageX - listWrapper.offsetLeft;
  scrollLeft = listWrapper.scrollLeft;
});

listWrapper.addEventListener("touchmove", (e) => {
  if (!isTouching) return;

  const x = e.touches[0].pageX - listWrapper.offsetLeft;
  const walk = startX - x;

  // 스크롤 이동량이 카드 폭 * 2 이상일 때만 이동
  const firstCard = listWrapper.querySelector('.listContent');
  if (!firstCard) return;

  const threshold = firstCard.offsetWidth * 2;
  if (Math.abs(walk) >= threshold) {
    const direction = walk > 0 ? 1 : -1;
    listWrapper.scrollBy({
      left: threshold * direction,
      behavior: "smooth"
    });

    // 터치 기준점 갱신
    startX = x;
    scrollLeft = listWrapper.scrollLeft;
  }
});

listWrapper.addEventListener("touchend", () => {
  isTouching = false;
});


listWrapper.addEventListener("click", e => {
  const card = e.target.closest(".listContent");
  if (!card) return;
  const id = card.dataset.id;
  const data = loadData();
  const list = data.find(x => x.id == id);

  /* 제목 수정 */
  if (e.target.classList.contains("modify_button")) {
    const titleText = card.querySelector(".titleText");
    titleText.setAttribute("contenteditable","true");
    titleText.focus();
    activateSave(card);
  }

  /* todolist 삭제 대기 */
  if (e.target.classList.contains("delTodo")) {
    const todoEl = e.target.closest(".todolist");
    const todo = list.todos.find(t => t.id == todoEl.dataset.id);
    todo.delPending = !todo.delPending;
    e.target.classList.toggle("pending");
    activateSave(card);
  }

  /* listContent 삭제 */
  if (e.target.classList.contains("delList")) {
    if (confirm("이 리스트 전체를 삭제할까요?")) {
      const idx = data.findIndex(x => x.id == id);
      data.splice(idx, 1);
      saveData(data);
      render();
      renderSorted(); // <-- 변경
      return;
    }
  }

  /* 저장 */
  if (e.target.classList.contains("save-btn") && !e.target.classList.contains("disabled")) {
    // 제목 저장
    const titleText = card.querySelector(".titleText");
    list.title = titleText.textContent.trim() || "제목 없음";

    // todolist 저장
    const todoEls = card.querySelectorAll(".todolist");
    const listTodos = [];
    todoEls.forEach(todoEl => {
      const todoId = Number(todoEl.dataset.id);
      const text = todoEl.querySelector(".content_area").textContent.slice(0,16);
      const done = todoEl.querySelector(".check").checked;
      const category = todoEl.querySelector(".category").value;
      const delPending = todoEl.querySelector(".delTodo").classList.contains("pending");
      if (!delPending) {
        listTodos.push({ id: todoId, text, done, category, delPending: false });
      }
    });
    list.todos = listTodos;

    saveData(data);
    renderSorted(); // <-- 변경
  }
});

/* content_area 입력 감지 */
listWrapper.addEventListener("input", e => {
  if (!e.target.classList.contains("content_area")) return;
  const card = e.target.closest(".listContent");
  if (!card) return;
  activateSave(card);
});

/* 체크박스 & category 변경 */
listWrapper.addEventListener("change", e => {
  if (!e.target.classList.contains("check") && !e.target.classList.contains("category")) return;
  const card = e.target.closest(".listContent");
  if (!card) return;
  activateSave(card);
});

/***********************
  새 listContent 생성
************************/
addListContentBtn.addEventListener("click", () => {
  const data = loadData();
  const newList = { id: Date.now(), title: "새 리스트", todos: [] };
  data.push(newList);
  saveData(data);
  renderSorted(); // <-- 변경
});

/***********************
  정렬
************************/
sortSelect.addEventListener("change", () => {
  renderSorted();
});

/***********************
  카테고리 필터 변경
************************/
categoryFilter.addEventListener("change", () => {
  renderSorted();
});

/***********************
  카테고리 설정
************************/
const CATEGORY_KEY = "todoCategories";

// 로드
function loadCategories() {
  return JSON.parse(localStorage.getItem(CATEGORY_KEY) || '["공부","운동","집안일","약속","기타"]');
}

// 저장
function saveCategories() {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}


const categoryPanel = document.getElementById("categoryPanel");
const categoryListEl = document.getElementById("categoryList");
const categoryCreateEl = document.getElementById("category_create");
const categoryModifyEl = document.getElementById("category_modify");
const modifyCategoryInput = document.getElementById("modifyCategory");

function renderCategoryList() {
  categoryListEl.innerHTML = "";
  categories.forEach((cat, idx) => {
    const div = document.createElement("div");
    div.id = `category${idx+1}`;
    div.textContent = cat;
    div.style.cursor = "pointer";

    div.addEventListener("click", () => {
      // 수정/삭제 모드
      categoryCreateEl.style.display = "none";
      categoryModifyEl.style.display = "flex";
      modifyCategoryInput.value = cat;
      modifyCategoryInput.dataset.index = idx;
    });

    categoryListEl.appendChild(div);
  });
}
// 새 카테고리 추가
addCategoryBtn.addEventListener("click", () => {
  const val = newCategoryInput.value.trim();
  if (!val) return alert("분류명을 입력하세요.");
  if (categories.includes(val)) return alert("이미 존재하는 분류입니다.");
  categories.push(val);
  newCategoryInput.value = "";
  saveCategories(); // ← 추가
  renderCategoryList();
});

// 수정 버튼
modifyCategoryBtn.addEventListener("click", () => {
  const idx = Number(modifyCategoryInput.dataset.index);
  const val = modifyCategoryInput.value.trim();
  if (!val) return alert("분류명을 입력하세요.");
  if (categories.includes(val) && categories[idx] !== val) return alert("이미 존재하는 분류입니다.");
  categories[idx] = val;
  saveCategories(); // ← 추가
  modifyCategoryInput.value = "";
  categoryModifyEl.style.display = "none";
  categoryCreateEl.style.display = "flex";
  renderCategoryList();
});

// 삭제 버튼
delCategoryBtn.addEventListener("click", () => {
  const idx = Number(modifyCategoryInput.dataset.index);
  if (!confirm(`"${categories[idx]}" 카테고리를 삭제하시겠습니까?`)) return;
  categories.splice(idx,1);
  saveCategories(); // ← 추가
  modifyCategoryInput.value = "";
  categoryModifyEl.style.display = "none";
  categoryCreateEl.style.display = "flex";
  renderCategoryList();
});

const moveUpCategoryBtn = document.getElementById("moveUpCategoryBtn");
const moveDownCategoryBtn = document.getElementById("moveDownCategoryBtn");

// 위로 이동
moveUpCategoryBtn.addEventListener("click", () => {
  const idx = Number(modifyCategoryInput.dataset.index);
  if (idx <= 0) return;
  [categories[idx - 1], categories[idx]] = [categories[idx], categories[idx - 1]];
  modifyCategoryInput.dataset.index = idx - 1;
  saveCategories();      // 로컬 저장
  renderCategoryList();
});

// 아래로 이동
moveDownCategoryBtn.addEventListener("click", () => {
  const idx = Number(modifyCategoryInput.dataset.index);
  if (idx >= categories.length - 1) return;
  [categories[idx], categories[idx + 1]] = [categories[idx + 1], categories[idx]];
  modifyCategoryInput.dataset.index = idx + 1;
  saveCategories();      // 로컬 저장
  renderCategoryList();
});

// 가로스크롤 숨기기
categoryListEl.style.overflowX = "hidden";

// 마우스 휠로 가로 스크롤
categoryListEl.addEventListener("wheel", (e) => {
  e.preventDefault(); // 세로 스크롤 막기
  categoryListEl.scrollLeft += e.deltaY; // 마우스 휠 세로 이동 -> 가로 이동
});

// 초기 렌더링
categories = loadCategories();
renderCategoryList();

/***********************
  로컬 저장: JSON 다운로드
************************/
saveBackupBtn.addEventListener("click", () => {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `todo_backup_${new Date().toISOString().slice(0,19)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

const importFileInput = document.getElementById("importFile");

// 기존 데이터 + 불러온 데이터 ID 재생성
function normalizeData(data) {
  return data.map(list => ({
    ...list,
    id: Date.now() + Math.random(),
    todos: Array.isArray(list.todos)
      ? list.todos.map(todo => ({ ...todo, id: Date.now() + Math.random() }))
      : []
  }));
}

// 커스텀 모달 생성
function showMergeModal(message) {
  return new Promise(resolve => {
    // 모달 배경
    const modal = document.createElement("div");
    modal.className = "custom-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <div class="modal-buttons">
          <button id="yesBtn">예</button>
          <button id="noBtn">아니오 (덮어쓰기)</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // 버튼 이벤트
    modal.querySelector("#yesBtn").addEventListener("click", () => {
      resolve(true);   // 병합
      modal.remove();
    });
    modal.querySelector("#noBtn").addEventListener("click", () => {
      resolve(false);  // 덮어쓰기
      modal.remove();
    });
  });
}

importFileInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async event => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!Array.isArray(importedData)) throw new Error("잘못된 JSON 형식");

      const currentData = loadData();
      let finalData;

      // 리스트는 기존 모달대로 처리
      if (currentData.length > 0) {
        const merge = await showMergeModal(
          "기존 데이터가 있습니다. <br>불러온 데이터를 병합하시겠습니까?"
        );
        finalData = merge
          ? [...currentData, ...normalizeData(importedData)]
          : normalizeData(importedData);
      } else {
        finalData = normalizeData(importedData);
      }

      // 카테고리 병합
      const importedCategories = importedData.flatMap(l => l.todos.map(t => t.category));
      importedCategories.forEach(cat => {
        if (!categories.includes(cat)) categories.push(cat);
      });

      saveData(finalData);
      renderSorted();
      renderCategoryList(); // <- 병합된 카테고리 반영
      alert("불러오기 완료!");
    } catch (err) {
      console.error(err);
      alert("JSON 파싱 실패 또는 형식이 올바르지 않습니다.");
    }
  };


  reader.readAsText(file);
  e.target.value = "";
});


/***********************
  초기 실행
************************/
renderSorted();

