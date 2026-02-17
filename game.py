"""
Exiblox v3 — ПОЛНАЯ ВЕРСИЯ (ПЕРЕПИСАННАЯ)
  ✨ Новые функции:
  - 📤 Publish Tab — публикация игр
  - 🤖 AI Assistant — умный помощник
  - 👤 Гостевой вход
  - 🌈 Радужный курсор
  - 🔄 Автовход в последний аккаунт
  - 🎮 Система публикации игр
  - 🔍 Поиск по имени игры
  - 🏗 Baseplate шаблон в Studio
  - ⭐ Улучшенная физика и графика
"""

import tkinter as tk
from tkinter import messagebox, colorchooser, scrolledtext
import json, os, hashlib, re, random, string
from datetime import datetime

THEMES = {
    "dark": {
        "bg_dark":"#1a1c1e","bg_mid":"#232527","bg_light":"#2b2d2f",
        "bg_input":"#383a3c","accent":"#00b2ff","green":"#02b757",
        "red":"#e74c3c","gold":"#FFD700","text":"#ffffff","subtext":"#a0a3a7",
        "border":"#3a3c3e","sidebar":"#191b1d",
    },
    "light": {
        "bg_dark":"#d8dce2","bg_mid":"#f0f2f5","bg_light":"#ffffff",
        "bg_input":"#e0e2e5","accent":"#0078d4","green":"#107c10",
        "red":"#d83b01","gold":"#c8820a","text":"#1a1a1a","subtext":"#555555",
        "border":"#c0c4cc","sidebar":"#dde1e6",
    },
    "bw": {
        "bg_dark":"#000000","bg_mid":"#111111","bg_light":"#222222",
        "bg_input":"#333333","accent":"#ffffff","green":"#bbbbbb",
        "red":"#888888","gold":"#ffffff","text":"#ffffff","subtext":"#aaaaaa",
        "border":"#444444","sidebar":"#000000",
    },
}
CURRENT_THEME = "dark"

def C(key):
    try:
        return THEMES.get(CURRENT_THEME, THEMES["dark"]).get(key, "#ffffff")
    except:
        return "#ffffff"

USERS_FILE = "exiblox_users.json"
GAMES_FILE = "exiblox_published_games.json"
CONFIG_FILE = "exiblox_config.json"
RAINBOW = ["#ff0000","#ff7700","#ffff00","#00cc00","#0000ff","#8800cc"]

def hp(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def valid_email(e):
    return bool(re.match(r"^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$", e))

def gen_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

def _darken(h):
    try:
        h = h.lstrip("#")
        r, g, b = (int(h[i:i+2], 16) for i in (0, 2, 4))
        return f"#{max(0,r-25):02x}{max(0,g-25):02x}{max(0,b-25):02x}"
    except:
        return h

def mk_btn(parent, text, cmd, bg=None, fg=None, w=None, h=2, px=0, py=0, font=None):
    try:
        bg = bg or C("accent")
        fg = fg or C("text")
        font = font or ("Segoe UI", 11, "bold")
        b = tk.Button(parent, text=text, command=cmd, bg=bg, fg=fg,
                      activebackground=bg, activeforeground=fg,
                      font=font, relief="flat", cursor="hand2",
                      width=w, height=h, bd=0, padx=px, pady=py)
        b.bind("<Enter>", lambda e: b.configure(bg=_darken(bg)))
        b.bind("<Leave>", lambda e: b.configure(bg=bg))
        return b
    except:
        return tk.Button(parent, text=text, command=cmd)

def mk_entry(parent, show="", w=30):
    try:
        c = tk.Frame(parent, bg=C("bg_input"), highlightthickness=1,
                     highlightbackground=C("border"), highlightcolor=C("accent"))
        kw = dict(font=("Segoe UI", 12), width=w, bg=C("bg_input"),
                  fg=C("text"), insertbackground=C("text"), relief="flat", bd=8)
        if show:
            kw["show"] = show
        e = tk.Entry(c, **kw)
        e.pack()
        e.bind("<FocusIn>",  lambda _: c.configure(highlightbackground=C("accent")))
        e.bind("<FocusOut>", lambda _: c.configure(highlightbackground=C("border")))
        return c, e
    except:
        c = tk.Frame(parent)
        e = tk.Entry(c)
        e.pack()
        return c, e

def lbl(parent, text="", font=None, fg=None, bg=None, **kw):
    try:
        return tk.Label(parent, text=text,
                        font=font or ("Segoe UI", 11),
                        fg=fg or C("text"),
                        bg=bg or C("bg_mid"), **kw)
    except:
        return tk.Label(parent, text=text)

class App:
    def __init__(self):
        self.current_user = None
        self.published_games = []
        self.config = {}
        self.users = {}
        self._load()
        self._load_games()
        self._load_config()

    def _load(self):
        try:
            if os.path.exists(USERS_FILE):
                with open(USERS_FILE, encoding="utf-8") as f:
                    self.users = json.load(f)
            else:
                self.users = {}
        except:
            self.users = {}

    def _save(self):
        try:
            with open(USERS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.users, f, indent=2, ensure_ascii=False)
        except:
            pass

    def _load_games(self):
        try:
            if os.path.exists(GAMES_FILE):
                with open(GAMES_FILE, encoding="utf-8") as f:
                    self.published_games = json.load(f)
            else:
                self.published_games = []
        except:
            self.published_games = []

    def _save_games(self):
        try:
            with open(GAMES_FILE, "w", encoding="utf-8") as f:
                json.dump(self.published_games, f, indent=2, ensure_ascii=False)
        except:
            pass

    def _load_config(self):
        try:
            if os.path.exists(CONFIG_FILE):
                with open(CONFIG_FILE, encoding="utf-8") as f:
                    self.config = json.load(f)
            else:
                self.config = {}
        except:
            self.config = {}

    def _save_config(self):
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
        except:
            pass

    def register(self, uname, pw, email):
        uname = uname.strip()
        if not uname or not pw or not email:
            return False, "Заполните все поля!"
        if len(uname) < 3:
            return False, "Никнейм >= 3 символа!"
        if uname in self.users:
            return False, "Пользователь уже существует!"
        if not valid_email(email):
            return False, "Некорректный email!"
        if len(pw) < 6:
            return False, "Пароль >= 6 символов!"
        self.users[uname] = {
            "password": hp(pw), "email": email,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "friends": [], "friend_requests": [],
            "invite_code": gen_code(), "robux": 0,
            "theme": "dark", "studio_projects": [],
            "published_games": [], "is_guest": False
        }
        self._save()
        return True, "OK"

    def login(self, uname, pw):
        uname = uname.strip()
        if uname not in self.users:
            return False, "Пользователь не найден!"
        if self.users[uname]["password"] != hp(pw):
            return False, "Неверный пароль!"
        self.current_user = uname
        self.config["last_user"] = uname
        self._save_config()
        return True, "OK"

    def login_guest(self):
        self.current_user = "Guest"
        if "Guest" not in self.users:
            self.users["Guest"] = {
                "password": "", "email": "guest@exiblox.com",
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "friends": [], "friend_requests": [],
                "invite_code": "GUEST000", "robux": 0,
                "theme": "dark", "studio_projects": [],
                "published_games": [], "is_guest": True
            }
        return True, "OK"

    @property
    def me(self):
        try:
            return self.users.get(self.current_user, {})
        except:
            return {}

    def send_req(self, to):
        if self.me.get("is_guest"):
            return False, "Гости не могут добавлять друзей!"
        me = self.current_user
        if to not in self.users: return False, "Не найден!"
        if to == me: return False, "Нельзя добавить себя!"
        if to in self.me.get("friends", []): return False, "Уже в друзьях!"
        if me in self.users[to].get("friend_requests", []): return False, "Уже отправлен!"
        self.users[to].setdefault("friend_requests", []).append(me)
        self._save()
        return True, f"Запрос отправлен {to}!"

    def accept(self, frm):
        me = self.current_user
        if frm in self.me.get("friend_requests", []):
            self.me["friend_requests"].remove(frm)
            self.me.setdefault("friends", []).append(frm)
            self.users[frm].setdefault("friends", []).append(me)
            self._save()
            return True
        return False

    def find_code(self, code):
        for u, d in self.users.items():
            if d.get("invite_code") == code.upper():
                return u
        return None

    def save_project(self, name, data):
        p = self.me.setdefault("studio_projects", [])
        for proj in p:
            if proj["name"] == name:
                proj["data"] = data
                proj["updated"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                self._save()
                return
        p.append({
            "name": name, "data": data,
            "created": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "updated": datetime.now().strftime("%Y-%m-%d %H:%M")
        })
        self._save()

    def publish_game(self, name, description, project_data):
        if self.me.get("is_guest"):
            return None, "Гости не могут публиковать игры!"
        
        game_id = gen_code()
        game = {
            "id": game_id,
            "name": name,
            "description": description,
            "author": self.current_user,
            "objects": project_data.get("objects", []),
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "icon": random.choice(["🎮", "🎯", "🏆", "⚡", "🌟", "🔥", "💎", "🎲"]),
            "color": random.choice(["#7c3aed", "#1a6fa8", "#b8860b", "#ba5a00", "#8b0000", "#3a4a5a", "#2d5a1b"]),
            "rating": "100%",
            "players": "0",
            "playable": True
        }
        
        self.published_games.append(game)
        self._save_games()
        self.me.setdefault("published_games", []).append(game_id)
        self._save()
        
        return game_id, "OK"

    def search_games(self, query):
        if not query or not query.strip():
            return self.published_games
        query = query.lower().strip()
        return [g for g in self.published_games if query in g["name"].lower()]

class LoginWin:
    def __init__(self, app):
        self.app = app
        self.win = tk.Tk()
        self.win.title("Exiblox")
        self.win.geometry("460x620")
        self.win.configure(bg=C("bg_mid"))
        self.win.resizable(False, False)
        self._ui()

    def _ui(self):
        tk.Frame(self.win, bg=C("bg_mid"), height=35).pack()
        lbl(self.win, "✦ Exiblox", font=("Segoe UI", 34, "bold"), bg=C("bg_mid")).pack()
        lbl(self.win, "Войдите в аккаунт", fg=C("subtext"), bg=C("bg_mid")).pack(pady=4)

        f = tk.Frame(self.win, bg=C("bg_mid"))
        f.pack(pady=20)

        lbl(f, "Никнейм", font=("Segoe UI", 11, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 5))
        self._uc, self._ue = mk_entry(f)
        self._uc.pack(pady=(0, 16))

        last_user = self.app.config.get("last_user", "")
        if last_user and last_user in self.app.users:
            self._ue.insert(0, last_user)

        lbl(f, "Пароль", font=("Segoe UI", 11, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 5))
        self._pc, self._pe = mk_entry(f, show="*")
        self._pc.pack(pady=(0, 26))

        mk_btn(f, "ВОЙТИ", self._login, w=28).pack(pady=(0, 10))
        mk_btn(f, "ВОЙТИ КАК ГОСТЬ 👤", self._login_guest, bg=C("bg_input"), fg=C("subtext"), w=28).pack(pady=(0, 10))

        sep = tk.Frame(f, bg=C("bg_mid"))
        sep.pack(fill="x", pady=8)
        tk.Frame(sep, bg=C("border"), height=1).pack(side="left", fill="x", expand=True)
        lbl(sep, "  или  ", fg=C("subtext"), font=("Segoe UI", 9), bg=C("bg_mid")).pack(side="left")
        tk.Frame(sep, bg=C("border"), height=1).pack(side="left", fill="x", expand=True)

        mk_btn(f, "СОЗДАТЬ АККАУНТ", self._reg, bg=C("green"), w=28).pack()
        self.win.bind("<Return>", lambda _: self._login())

    def _login(self):
        ok, msg = self.app.login(self._ue.get(), self._pe.get())
        if ok:
            self.win.destroy()
            MainWin(self.app)
        else:
            messagebox.showerror("Ошибка", msg, parent=self.win)

    def _login_guest(self):
        ok, msg = self.app.login_guest()
        if ok:
            self.win.destroy()
            MainWin(self.app)

    def _reg(self):
        self.win.destroy()
        RegWin(self.app)

    def run(self):
        self.win.mainloop()

class RegWin:
    def __init__(self, app):
        self.app = app
        self.win = tk.Tk()
        self.win.title("Exiblox — Регистрация")
        self.win.geometry("460x660")
        self.win.configure(bg=C("bg_mid"))
        self.win.resizable(False, False)
        self._ui()

    def _ui(self):
        tk.Frame(self.win, bg=C("bg_mid"), height=30).pack()
        lbl(self.win, "✦ Exiblox", font=("Segoe UI", 32, "bold"), bg=C("bg_mid")).pack()
        lbl(self.win, "Создать аккаунт", fg=C("subtext"), bg=C("bg_mid")).pack(pady=4)

        f = tk.Frame(self.win, bg=C("bg_mid"))
        f.pack(pady=16)

        fields = [
            ("Никнейм", False, "_u"),
            ("Email", False, "_em"),
            ("Пароль", True, "_p"),
            ("Повторите пароль", True, "_p2"),
        ]
        for txt, sec, attr in fields:
            lbl(f, txt, font=("Segoe UI", 11, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 5))
            c, e = mk_entry(f, show="*" if sec else "")
            c.pack(pady=(0, 14))
            setattr(self, attr + "c", c)
            setattr(self, attr, e)

        mk_btn(f, "ЗАРЕГИСТРИРОВАТЬСЯ", self._do, bg=C("green"), w=28).pack(pady=(10, 14))

        row = tk.Frame(f, bg=C("bg_mid"))
        row.pack()
        lbl(row, "Уже есть аккаунт? ", fg=C("subtext"), bg=C("bg_mid")).pack(side="left")
        back = lbl(row, "Войти", fg=C("accent"), font=("Segoe UI", 11, "bold"),
                   bg=C("bg_mid"), cursor="hand2")
        back.pack(side="left")
        back.bind("<Button-1>", lambda _: self._back())

    def _do(self):
        if self._p.get() != self._p2.get():
            messagebox.showerror("Ошибка", "Пароли не совпадают!", parent=self.win)
            return
        ok, msg = self.app.register(self._u.get(), self._p.get(), self._em.get())
        if ok:
            self.app.current_user = self._u.get().strip()
            self.app.config["last_user"] = self.app.current_user
            self.app._save_config()
            messagebox.showinfo("Готово!",
                                f"Аккаунт создан!\nКод: {self.app.me.get('invite_code', 'N/A')}",
                                parent=self.win)
            self.win.destroy()
            MainWin(self.app)
        else:
            messagebox.showerror("Ошибка", msg, parent=self.win)

    def _back(self):
        self.win.destroy()
        LoginWin(self.app).run()

    def run(self):
        self.win.mainloop()

NAV = [
    ("🏠", "Home",    "home"),
    ("📊", "Charts",  "charts"),
    ("👤", "Avatar",  "avatar"),
    ("🎮", "Party",   "party"),
    ("👥", "Friends", "friends"),
    ("🎨", "Themes",  "themes"),
    ("🛠",  "Studio",  "studio"),
    ("⋯",  "More",    "more"),
    ("📤", "Publish", "publish"),
    ("🤖", "AI",      "ai"),
]

class MainWin:
    def __init__(self, app):
        self.app = app
        self.win = tk.Tk()
        self.win.title("Exiblox v3")
        self.win.geometry("1300x820")
        self.win.configure(bg=C("bg_mid"))
        self.tab = "home"
        self._nb = {}
        
        try:
            self._build()
            self.win.mainloop()
        except Exception as e:
            print(f"Ошибка: {e}")
            import traceback
            traceback.print_exc()

    def _build(self):
        # Topbar
        topbar = tk.Frame(self.win, bg=C("bg_dark"), height=64)
        topbar.pack(fill="x", side="top")
        topbar.pack_propagate(False)
        
        lbl(topbar, "✦ Exiblox", font=("Segoe UI", 15, "bold"), bg=C("bg_dark")).pack(side="left", padx=22, pady=10)
        
        sf = tk.Frame(topbar, bg=C("bg_light"), highlightthickness=1, highlightbackground=C("border"))
        sf.pack(side="left", padx=10, pady=10, fill="x", expand=True)
        lbl(sf, "🔍", fg=C("subtext"), bg=C("bg_light")).pack(side="left", padx=8)
        self.search_entry = tk.Entry(sf, font=("Segoe UI", 11), width=40, bg=C("bg_light"), 
                                     fg=C("text"), insertbackground=C("text"), relief="flat", bd=4)
        self.search_entry.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self.search_entry.bind("<Return>", self._do_search)
        
        uf = tk.Frame(topbar, bg=C("bg_dark"))
        uf.pack(side="right", padx=20, pady=10)
        lbl(uf, f"💰 {self.app.me.get('robux', 0)} R$", fg=C("gold"), font=("Segoe UI", 11, "bold"), bg=C("bg_dark")).pack(side="left", padx=12)
        mk_btn(uf, f"👤 {self.app.current_user}", self._profile, bg=C("bg_light"), h=1, px=12, py=6).pack(side="left")
        
        # Основной контент
        main = tk.Frame(self.win, bg=C("bg_mid"))
        main.pack(fill="both", expand=True, side="top")
        
        # Sidebar
        sb = tk.Frame(main, bg=C("sidebar"), width=105)
        sb.pack(fill="y", side="left")
        sb.pack_propagate(False)
        tk.Frame(sb, bg=C("sidebar"), height=8).pack()
        
        for ic, tx, tab in NAV:
            b = tk.Button(sb, text=f"{ic}\n{tx}", font=("Segoe UI", 9),
                          bg=C("bg_light") if tab == self.tab else C("sidebar"),
                          fg=C("text"), relief="flat", width=9, height=3, cursor="hand2",
                          bd=0, activebackground=C("bg_light"), activeforeground=C("text"),
                          command=lambda t=tab: self._show(t))
            b.pack(pady=3)
            self._nb[tab] = b
        
        # Content
        self.content = tk.Frame(main, bg=C("bg_mid"))
        self.content.pack(fill="both", expand=True, side="left")
        
        self._show("home")

    def _do_search(self, event=None):
        query = self.search_entry.get()
        self._show_search_results(query)

    def _show_search_results(self, query):
        for w in self.content.winfo_children():
            w.destroy()
        
        cv = tk.Canvas(self.content, bg=C("bg_mid"), highlightthickness=0)
        sb = tk.Scrollbar(self.content, orient="vertical", command=cv.yview)
        inn = tk.Frame(cv, bg=C("bg_mid"))
        inn.bind("<Configure>", lambda _: cv.configure(scrollregion=cv.bbox("all")))
        cv.create_window((0, 0), window=inn, anchor="nw")
        cv.configure(yscrollcommand=sb.set)
        cv.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        cv.bind("<MouseWheel>", lambda e: cv.yview_scroll(int(-1 * (e.delta / 120)), "units"))
        
        lbl(inn, f"🔍 Результаты поиска: '{query}'", font=("Segoe UI", 24, "bold"), bg=C("bg_mid")).pack(anchor="w", padx=30, pady=(25, 20))
        
        results = self.app.search_games(query)
        if results:
            self._game_section(inn, f"Найдено игр: {len(results)}", results)
        else:
            lbl(inn, "Ничего не найдено 😕", fg=C("subtext"), font=("Segoe UI", 16), bg=C("bg_mid")).pack(pady=40)

    def _show(self, tab):
        for t, b in self._nb.items():
            b.configure(bg=C("bg_light") if t == tab else C("sidebar"))
        self.tab = tab
        for w in self.content.winfo_children():
            w.destroy()
        
        {
            "home": self._home, "charts": self._charts, "avatar": self._avatar,
            "party": self._party, "friends": self._friends, "themes": self._themes,
            "studio": self._studio, "more": self._more, "publish": self._publish,
            "ai": self._ai
        }.get(tab, self._home)()

    def _scroll(self):
        cv = tk.Canvas(self.content, bg=C("bg_mid"), highlightthickness=0)
        sb = tk.Scrollbar(self.content, orient="vertical", command=cv.yview)
        inn = tk.Frame(cv, bg=C("bg_mid"))
        inn.bind("<Configure>", lambda _: cv.configure(scrollregion=cv.bbox("all")))
        cv.create_window((0, 0), window=inn, anchor="nw")
        cv.configure(yscrollcommand=sb.set)
        cv.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        cv.bind("<MouseWheel>", lambda e: cv.yview_scroll(int(-1 * (e.delta / 120)), "units"))
        return cv, inn

    def _home(self):
        _, inn = self._scroll()
        tk.Frame(inn, bg=C("bg_mid"), height=10).pack()
        lbl(inn, "Home", font=("Segoe UI", 26, "bold"), bg=C("bg_mid")).pack(anchor="w", padx=30)
        
        sec = tk.Frame(inn, bg=C("bg_mid"))
        sec.pack(fill="x", padx=30, pady=(18, 22))
        h = tk.Frame(sec, bg=C("bg_mid"))
        h.pack(fill="x", pady=(0, 12))
        fr = self.app.me.get("friends", [])
        lbl(h, f"Connections ({len(fr)}) >", font=("Segoe UI", 16, "bold"), bg=C("bg_mid")).pack(side="left")
        mk_btn(h, "+ Add Friends", self._add_friend, h=1, px=16, py=7).pack(side="right")
        row = tk.Frame(sec, bg=C("bg_mid"))
        row.pack(fill="x")
        
        if fr:
            for f in fr[:12]:
                self._fcard(row, f)
        else:
            lbl(row, "Нет друзей. Добавьте по коду!", fg=C("subtext"), bg=C("bg_mid")).pack(pady=16)
        
        all_games = self.app.published_games
        if all_games:
            self._game_section(inn, "🎮 Играть сейчас", all_games[:4])
            if len(all_games) > 4:
                self._game_section(inn, "⭐ Популярные", all_games[4:8])
        else:
            lbl(inn, "Пока нет опубликованных игр...", fg=C("subtext"), font=("Segoe UI", 14), bg=C("bg_mid")).pack(anchor="w", padx=30, pady=20)

    def _fcard(self, p, uname):
        c = tk.Frame(p, bg=C("bg_light"), width=110, height=130, highlightthickness=1, highlightbackground=C("border"))
        c.pack(side="left", padx=5)
        c.pack_propagate(False)
        av = tk.Frame(c, bg="#3d3f41", width=68, height=68)
        av.pack(pady=(8, 4))
        av.pack_propagate(False)
        lbl(av, "👤", font=("Segoe UI", 28), bg="#3d3f41").pack(expand=True)
        lbl(c, uname[:11], font=("Segoe UI", 9, "bold"), bg=C("bg_light")).pack()
        lbl(c, "● Online", fg=C("green"), font=("Segoe UI", 8), bg=C("bg_light")).pack(pady=2)

    def _game_section(self, p, title, games):
        sec = tk.Frame(p, bg=C("bg_mid"))
        sec.pack(fill="x", padx=30, pady=(0, 26))
        lbl(sec, title, font=("Segoe UI", 16, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 12))
        row = tk.Frame(sec, bg=C("bg_mid"))
        row.pack(fill="x")
        for g in games[:4]:
            self._gcard(row, g)

    def _gcard(self, p, g):
        card = tk.Frame(p, bg=C("bg_light"), width=210, height=290, cursor="hand2", highlightthickness=1, highlightbackground=C("border"))
        card.pack(side="left", padx=7)
        card.pack_propagate(False)
        th = tk.Frame(card, bg=g.get("color", "#2a2d50"), height=150)
        th.pack(fill="x")
        th.pack_propagate(False)
        ico = lbl(th, g.get("icon", "🎮"), font=("Segoe UI", 54), bg=g.get("color", "#2a2d50"))
        ico.pack(expand=True)
        inf = tk.Frame(card, bg=C("bg_light"))
        inf.pack(fill="both", expand=True, padx=9, pady=7)
        lbl(inf, g.get("name", "Unknown"), font=("Segoe UI", 9, "bold"), bg=C("bg_light"), wraplength=188, justify="left").pack(anchor="w", pady=(0, 3))
        lbl(inf, f"by {g.get('author', 'Unknown')}", font=("Segoe UI", 8), fg=C("subtext"), bg=C("bg_light")).pack(anchor="w", pady=(0, 5))
        st = tk.Frame(inf, bg=C("bg_light"))
        st.pack(anchor="w")
        lbl(st, f"👍 {g.get('rating', '0%')}", font=("Segoe UI", 8), fg=C("subtext"), bg=C("bg_light")).pack(side="left", padx=(0, 10))
        lbl(st, f"👥 {g.get('players', '0')}", font=("Segoe UI", 8), fg=C("subtext"), bg=C("bg_light")).pack(side="left")

        def click(e, gg=g):
            if gg.get("playable"):
                try:
                    GameScene(self.app, gg, self.win)
                except:
                    pass

        for w in (card, th, ico, inf):
            w.bind("<Button-1>", click)

    def _charts(self):
        _, inn = self._scroll()
        lbl(inn, "📊 Топ игр", font=("Segoe UI", 24, "bold"), bg=C("bg_mid")).pack(anchor="w", padx=30, pady=(25, 20))
        
        def sort_key(g):
            p = g.get("players", "0").replace("K", "000").replace("M", "000000").replace(".", "")
            try:
                return int(p)
            except:
                return 0
        
        games = sorted(self.app.published_games, key=sort_key, reverse=True)
        
        if games:
            for i, g in enumerate(games[:20], 1):
                row = tk.Frame(inn, bg=C("bg_light"), highlightthickness=1, highlightbackground=C("border"))
                row.pack(fill="x", padx=30, pady=5)
                lbl(row, f"#{i}", font=("Segoe UI", 14, "bold"), fg=C("subtext"), bg=C("bg_light")).pack(side="left", padx=16, pady=12)
                lbl(row, g.get("icon", "🎮"), font=("Segoe UI", 22), bg=C("bg_light")).pack(side="left", padx=8)
                lbl(row, g.get("name", "Unknown"), font=("Segoe UI", 12, "bold"), bg=C("bg_light")).pack(side="left", padx=8)
                lbl(row, f"by {g.get('author', 'Unknown')}", font=("Segoe UI", 9), fg=C("subtext"), bg=C("bg_light")).pack(side="left", padx=5)
                lbl(row, f"👥 {g.get('players', '0')}", fg=C("subtext"), font=("Segoe UI", 10), bg=C("bg_light")).pack(side="right", padx=20)
                lbl(row, f"👍 {g.get('rating', '0%')}", fg=C("green"), font=("Segoe UI", 10, "bold"), bg=C("bg_light")).pack(side="right", padx=8)

    def _avatar(self):
        lbl(self.content, "👤 Avatar", font=("Segoe UI", 26, "bold"), bg=C("bg_mid")).pack(pady=80)
        lbl(self.content, "Кастомизация аватара — скоро", fg=C("subtext"), bg=C("bg_mid")).pack()

    def _party(self):
        lbl(self.content, "🎮 Party", font=("Segoe UI", 26, "bold"), bg=C("bg_mid")).pack(pady=80)
        lbl(self.content, "Создавайте группы — скоро", fg=C("subtext"), bg=C("bg_mid")).pack()

    def _publish(self):
        if self.app.me.get("is_guest"):
            lbl(self.content, "📤 Publish Games", font=("Segoe UI", 26, "bold"), bg=C("bg_mid")).pack(pady=80)
            lbl(self.content, "Гости не могут публиковать игры.\nСоздайте аккаунт!", fg=C("subtext"), font=("Segoe UI", 14), bg=C("bg_mid")).pack()
            return
        
        _, inn = self._scroll()
        lbl(inn, "📤 Мои опубликованные игры", font=("Segoe UI", 24, "bold"), bg=C("bg_mid")).pack(anchor="w", padx=30, pady=(25, 20))
        
        my_games = [g for g in self.app.published_games if g.get("author") == self.app.current_user]
        
        if my_games:
            self._game_section(inn, f"Всего игр: {len(my_games)}", my_games)
        else:
            lbl(inn, "У вас пока нет опубликованных игр", fg=C("subtext"), font=("Segoe UI", 14), bg=C("bg_mid")).pack(anchor="w", padx=30, pady=20)

    def _friends(self):
        h = tk.Frame(self.content, bg=C("bg_mid"))
        h.pack(fill="x", padx=30, pady=22)
        lbl(h, "👥 Friends", font=("Segoe UI", 24, "bold"), bg=C("bg_mid")).pack(side="left")
        mk_btn(h, "+ Add Friends", self._add_friend, h=1, px=16, py=7).pack(side="right")
        _, inn = self._scroll()
        me = self.app.me
        if me.get("friend_requests"):
            sec = tk.Frame(inn, bg=C("bg_mid"))
            sec.pack(fill="x", padx=30, pady=(0, 22))
            lbl(sec, "Запросы", font=("Segoe UI", 15, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 10))
            for req in me["friend_requests"]:
                rc = tk.Frame(sec, bg=C("bg_light"), highlightthickness=1, highlightbackground=C("border"))
                rc.pack(fill="x", pady=4)
                lbl(rc, f"👤  {req}", font=("Segoe UI", 12, "bold"), bg=C("bg_light")).pack(side="left", padx=16, pady=12)
                def acc(u=req):
                    self.app.accept(u)
                    messagebox.showinfo("OK", f"{u} добавлен!")
                    self._show("friends")
                mk_btn(rc, "Принять", acc, bg=C("green"), h=1, px=12, py=7).pack(side="right", padx=10)
        sec2 = tk.Frame(inn, bg=C("bg_mid"))
        sec2.pack(fill="x", padx=30)
        fr = me.get("friends", [])
        lbl(sec2, f"Друзья ({len(fr)})", font=("Segoe UI", 15, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 10))
        if fr:
            for f in fr:
                fc = tk.Frame(sec2, bg=C("bg_light"), highlightthickness=1, highlightbackground=C("border"))
                fc.pack(fill="x", pady=4)
                av = tk.Frame(fc, bg="#3d3f41", width=44, height=44)
                av.pack(side="left", padx=12, pady=10)
                av.pack_propagate(False)
                lbl(av, "👤", font=("Segoe UI", 20), bg="#3d3f41").pack(expand=True)
                inf2 = tk.Frame(fc, bg=C("bg_light"))
                inf2.pack(side="left", fill="x", expand=True)
                lbl(inf2, f, font=("Segoe UI", 12, "bold"), bg=C("bg_light")).pack(anchor="w")
                lbl(inf2, "● Online", fg=C("green"), font=("Segoe UI", 9), bg=C("bg_light")).pack(anchor="w")
        else:
            lbl(sec2, "Нет друзей", fg=C("subtext"), bg=C("bg_mid")).pack(pady=20)

    def _themes(self):
        global CURRENT_THEME
        f = tk.Frame(self.content, bg=C("bg_mid"))
        f.pack(expand=True)
        lbl(f, "🎨 Выберите тему", font=("Segoe UI", 26, "bold"), bg=C("bg_mid")).pack(pady=(50, 10))
        lbl(f, "Изменение применится после перезапуска", fg=C("subtext"), bg=C("bg_mid")).pack(pady=(0, 35))
        cf = tk.Frame(f, bg=C("bg_mid"))
        cf.pack()
        themes_info = [
            ("dark",  "🌙", "Тёмная",       "Классический тёмный", "#1a1c1e", "#ffffff"),
            ("light", "☀️", "Светлая",      "Чистый белый",        "#f0f2f5", "#1a1a1a"),
            ("bw",    "◐",  "Чёрно-белая",  "Монохромный стиль",   "#111111", "#ffffff"),
        ]

        def apply_theme(t):
            global CURRENT_THEME
            CURRENT_THEME = t
            self.app.me["theme"] = t
            self.app._save()
            messagebox.showinfo("Тема сохранена", "Перезапустите приложение для полного применения темы.", parent=self.win)

        for tid, icon, name, desc, bg, fg in themes_info:
            active = tid == CURRENT_THEME
            card = tk.Frame(cf, bg=bg, width=200, height=230, cursor="hand2", highlightthickness=3 if active else 1, highlightbackground=C("accent") if active else C("border"))
            card.pack(side="left", padx=15)
            card.pack_propagate(False)
            tk.Label(card, text=icon, font=("Segoe UI", 40), bg=bg, fg=fg).pack(pady=(28, 6))
            tk.Label(card, text=name, font=("Segoe UI", 14, "bold"), bg=bg, fg=fg).pack()
            tk.Label(card, text=desc, font=("Segoe UI", 9), bg=bg, fg=fg, wraplength=170).pack(pady=5)
            if active:
                tk.Label(card, text="✓ Активна", font=("Segoe UI", 10, "bold"), bg=bg, fg="#00b2ff").pack()
            else:
                tk.Button(card, text="Применить", font=("Segoe UI", 10), bg="#00b2ff", fg="#fff", relief="flat", cursor="hand2", command=lambda t=tid: apply_theme(t)).pack(pady=6)

    def _studio(self):
        try:
            ExiStudio(self.app, self.win)
        except Exception as e:
            messagebox.showerror("Ошибка", f"Ошибка Studio: {e}", parent=self.win)

    def _more(self):
        f = tk.Frame(self.content, bg=C("bg_mid"))
        f.pack(expand=True)
        lbl(f, "⋯ Настройки", font=("Segoe UI", 24, "bold"), bg=C("bg_mid")).pack(pady=28)
        card = tk.Frame(f, bg=C("bg_light"), highlightthickness=1, highlightbackground=C("border"))
        card.pack(pady=16, ipadx=18, ipady=16)
        me = self.app.me
        
        guest_badge = " 👤 (Гость)" if me.get("is_guest") else ""
        lbl(card, f"👤  {self.app.current_user}{guest_badge}", font=("Segoe UI", 16, "bold"), bg=C("bg_light")).pack(pady=8)
        
        if not me.get("is_guest"):
            lbl(card, f"🎫  Код: {me.get('invite_code', 'N/A')}", fg=C("accent"), font=("Segoe UI", 12, "bold"), bg=C("bg_light")).pack(pady=4)
        
        lbl(card, f"👥  Друзей: {len(me.get('friends', []))}", fg=C("subtext"), bg=C("bg_light")).pack(pady=3)
        lbl(card, f"💰  {me.get('robux', 0)} R$", fg=C("gold"), bg=C("bg_light")).pack(pady=3)
        lbl(card, f"🛠  Проектов: {len(me.get('studio_projects', []))}", fg=C("subtext"), bg=C("bg_light")).pack(pady=3)
        lbl(card, f"📤  Опубликовано: {len(me.get('published_games', []))}", fg=C("accent"), bg=C("bg_light")).pack(pady=(3, 10))
        
        mk_btn(f, "🚪 Выйти", self._logout, bg=C("red"), w=18).pack(pady=16)

    def _ai(self):
        f = tk.Frame(self.content, bg=C("bg_mid"))
        f.pack(fill="both", expand=True)
        
        header = tk.Frame(f, bg=C("bg_dark"))
        header.pack(fill="x")
        lbl(header, "🤖 AI Assistant", font=("Segoe UI", 20, "bold"), bg=C("bg_dark")).pack(side="left", padx=20, pady=15)
        lbl(header, "Умный помощник Exiblox", fg=C("subtext"), font=("Segoe UI", 11), bg=C("bg_dark")).pack(side="left")
        
        chat_frame = tk.Frame(f, bg=C("bg_mid"))
        chat_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        self.chat_display = scrolledtext.ScrolledText(chat_frame, font=("Segoe UI", 11), bg=C("bg_light"), fg=C("text"), relief="flat", wrap="word", height=20)
        self.chat_display.pack(fill="both", expand=True, pady=(0, 10))
        self.chat_display.config(state="disabled")
        
        self._ai_add_message("AI", "Привет! Я AI помощник Exiblox. Задай мне любой вопрос! 🚀")
        
        quick_frame = tk.Frame(chat_frame, bg=C("bg_mid"))
        quick_frame.pack(fill="x", pady=(0, 10))
        
        quick_buttons = [
            ("Как создать игру?", "Как создать игру в ExiStudio?"),
            ("Что такое Baseplate?", "Расскажи про Baseplate"),
            ("Как опубликовать?", "Как опубликовать игру?"),
            ("Python советы", "Дай советы по Python"),
        ]
        
        for i, (label, query) in enumerate(quick_buttons):
            def make_quick(q=query):
                self.ai_input.delete(0, "end")
                self.ai_input.insert(0, q)
                self._ai_send()
            
            mk_btn(quick_frame, label, make_quick, bg=C("bg_input"), fg=C("text"), h=1, px=10, py=5, font=("Segoe UI", 9)).pack(side="left", padx=5)
        
        input_frame = tk.Frame(chat_frame, bg=C("bg_mid"))
        input_frame.pack(fill="x")
        
        ic, self.ai_input = mk_entry(input_frame, w=80)
        ic.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.ai_input.bind("<Return>", lambda e: self._ai_send())
        
        mk_btn(input_frame, "Отправить 🚀", self._ai_send, w=12, h=1, py=8).pack(side="right")

    def _ai_add_message(self, sender, text):
        self.chat_display.config(state="normal")
        if sender == "AI":
            self.chat_display.insert("end", "🤖 AI: ", "ai_label")
        else:
            self.chat_display.insert("end", "👤 Вы: ", "user_label")
        
        self.chat_display.insert("end", f"{text}\n\n")
        
        self.chat_display.tag_config("ai_label", foreground=C("accent"), font=("Segoe UI", 11, "bold"))
        self.chat_display.tag_config("user_label", foreground=C("green"), font=("Segoe UI", 11, "bold"))
        
        self.chat_display.see("end")
        self.chat_display.config(state="disabled")

    def _ai_send(self):
        query = self.ai_input.get().strip()
        if not query:
            return
        
        self._ai_add_message("Вы", query)
        self.ai_input.delete(0, "end")
        
        response = self._ai_get_response(query)
        self.win.after(500, lambda: self._ai_add_message("AI", response))

    def _ai_get_response(self, query):
        q = query.lower()
        
        if "привет" in q or "здравствуй" in q:
            return "Привет! 👋 Как я могу помочь?"
        elif "игр" in q and "созда" in q:
            return "1. Открой вкладку 'Studio' (🛠)\n2. Выбери инструмент\n3. Размещай объекты\n4. Нажми 'Publish'"
        elif "baseplate" in q or "басплейт" in q:
            return "Baseplate - стартовый шаблон с платформой и точкой спавна!"
        elif "публик" in q:
            return "Нажми 'Publish' в Studio, введи название и описание игры!"
        else:
            return "Интересный вопрос! Спроси что-то о создании игр или Studio 🎮"

    def _profile(self):
        pop = tk.Toplevel(self.win)
        pop.title("Профиль")
        pop.geometry("340x300")
        pop.configure(bg=C("bg_mid"))
        pop.resizable(False, False)
        me = self.app.me
        
        guest_badge = " 👤 (Гость)" if me.get("is_guest") else ""
        lbl(pop, f"👤  {self.app.current_user}{guest_badge}", font=("Segoe UI", 16, "bold"), bg=C("bg_mid")).pack(pady=16)
        
        info = [f"💰  {me.get('robux', 0)} R$", f"👥  Друзей: {len(me.get('friends', []))}"]
        
        if not me.get("is_guest"):
            info.insert(0, f"📧  {me.get('email', 'N/A')}")
            info.append(f"🎫  Код: {me.get('invite_code', 'N/A')}")
        
        for t in info:
            lbl(pop, t, fg=C("subtext"), bg=C("bg_mid")).pack(pady=3)
        
        mk_btn(pop, "Закрыть", pop.destroy, bg=C("bg_input"), w=12, h=1, py=7).pack(pady=14)

    def _add_friend(self):
        if self.app.me.get("is_guest"):
            messagebox.showinfo("Недоступно", "Гости не могут добавлять друзей!", parent=self.win)
            return
        
        dlg = tk.Toplevel(self.win)
        dlg.title("Add Friend")
        dlg.geometry("420x340")
        dlg.configure(bg=C("bg_mid"))
        dlg.resizable(False, False)
        lbl(dlg, "Добавить друга", font=("Segoe UI", 16, "bold"), bg=C("bg_mid")).pack(pady=18)
        lbl(dlg, "Никнейм или код", fg=C("subtext"), bg=C("bg_mid")).pack()
        c, e = mk_entry(dlg)
        c.pack(pady=14)
        e.focus()
        code_box = tk.Frame(dlg, bg=C("bg_light"))
        code_box.pack(fill="x", padx=45, pady=6)
        lbl(code_box, f"🎫  Ваш код: {self.app.me.get('invite_code', 'N/A')}", font=("Segoe UI", 13, "bold"), fg=C("accent"), bg=C("bg_light")).pack(pady=12)
        lbl(code_box, "Поделитесь с другом!", font=("Segoe UI", 9), fg=C("subtext"), bg=C("bg_light")).pack(pady=(0, 8))

        def send():
            txt = e.get().strip()
            if not txt:
                messagebox.showerror("Ошибка", "Введите никнейм или код!", parent=dlg)
                return
            target = self.app.find_code(txt) if (len(txt) == 8 and txt.upper() == txt) else txt
            if not target:
                messagebox.showerror("Ошибка", "Не найдено!", parent=dlg)
                return
            ok, msg = self.app.send_req(target)
            if ok:
                messagebox.showinfo("OK", msg, parent=dlg)
                dlg.destroy()
            else:
                messagebox.showerror("Ошибка", msg, parent=dlg)

        e.bind("<Return>", lambda _: send())
        mk_btn(dlg, "Отправить запрос", send, w=20, h=1, py=9).pack(pady=12)

    def _logout(self):
        self.app.current_user = None
        self.win.destroy()
        LoginWin(self.app).run()

class GameScene:
    W, H = 900, 560
    GRAVITY = 0.55
    JUMP = -14
    SPEED = 5
    FLOOR = 460

    def __init__(self, app, game, master):
        self.app = app
        self.game = game
        self.win = tk.Toplevel(master)
        self.win.title(game.get("name", "Game"))
        self.win.geometry(f"{self.W}x{self.H + 130}")
        self.win.configure(bg=C("bg_dark"))
        self.win.resizable(False, False)

        self.px, self.py = 100.0, float(self.FLOOR - 60)
        self.vx, self.vy = 0.0, 0.0
        self.on_ground = True
        self.step = 0
        self.keys = {"left": False, "right": False}

        if game.get("objects"):
            self.platforms = [(obj["x"], obj["y"], obj["w"], obj["h"]) for obj in game["objects"] if obj["type"] == "Блок"]
            coin_objs = [obj for obj in game["objects"] if obj["type"] == "Монета"]
            self.coins = [(obj["x"] + obj["w"]//2, obj["y"] + obj["h"]//2) for obj in coin_objs]
        else:
            self.platforms = [(0, self.FLOOR, self.W * 3, 30), (200, 360, 140, 18), (420, 300, 140, 18), (600, 240, 140, 18)]
            self.coins = [(240, 340), (460, 278), (640, 218), (330, 168)]
        
        self.collected = set()
        self._build()
        self._bind()
        self._loop()

    def _build(self):
        self.cv = tk.Canvas(self.win, width=self.W, height=self.H, bg="#1a2040", highlightthickness=0)
        self.cv.pack()

        ctrl = tk.Frame(self.win, bg=C("bg_dark"), height=125)
        ctrl.pack(fill="x")

        joy = tk.Frame(ctrl, bg=C("bg_dark"))
        joy.pack(side="left", padx=30, pady=8)
        lbl(joy, "🕹 Движение", fg=C("subtext"), bg=C("bg_dark"), font=("Segoe UI", 9)).pack()
        btns = tk.Frame(joy, bg=C("bg_dark"))
        btns.pack()

        bl = tk.Button(btns, text="◀", font=("Segoe UI", 18, "bold"), bg="#252850", fg="white", relief="flat", width=4, height=2, cursor="hand2")
        bl.pack(side="left", padx=5)
        bl.bind("<ButtonPress-1>", lambda e: self.keys.update({"left": True}))
        bl.bind("<ButtonRelease-1>", lambda e: self.keys.update({"left": False}))

        br = tk.Button(btns, text="▶", font=("Segoe UI", 18, "bold"), bg="#252850", fg="white", relief="flat", width=4, height=2, cursor="hand2")
        br.pack(side="left", padx=5)
        br.bind("<ButtonPress-1>", lambda e: self.keys.update({"right": True}))
        br.bind("<ButtonRelease-1>", lambda e: self.keys.update({"right": False}))

        total_coins = len(self.coins)
        self.score_var = tk.StringVar(value=f"🪙 0 / {total_coins}")
        tk.Label(ctrl, textvariable=self.score_var, font=("Segoe UI", 15, "bold"), fg=C("gold"), bg=C("bg_dark")).pack(side="left", expand=True)

        jf = tk.Frame(ctrl, bg=C("bg_dark"))
        jf.pack(side="right", padx=40, pady=8)
        lbl(jf, "Прыжок", fg=C("subtext"), bg=C("bg_dark"), font=("Segoe UI", 9)).pack()
        jb = tk.Button(jf, text="🔼", font=("Segoe UI", 22, "bold"), bg="#c0392b", fg="white", relief="flat", width=5, height=2, cursor="hand2")
        jb.pack()
        jb.bind("<ButtonPress-1>", lambda e: self._jump())

    def _bind(self):
        self.win.bind("<KeyPress-Left>", lambda e: self.keys.update({"left": True}))
        self.win.bind("<KeyRelease-Left>", lambda e: self.keys.update({"left": False}))
        self.win.bind("<KeyPress-Right>", lambda e: self.keys.update({"right": True}))
        self.win.bind("<KeyRelease-Right>", lambda e: self.keys.update({"right": False}))
        self.win.bind("<KeyPress-space>", lambda e: self._jump())
        self.win.bind("<KeyPress-Up>", lambda e: self._jump())
        self.win.focus_set()

    def _jump(self):
        if self.on_ground:
            self.vy = self.JUMP
            self.on_ground = False

    def _loop(self):
        if not self.win.winfo_exists():
            return
        self._update()
        self._draw()
        self.win.after(16, self._loop)

    def _update(self):
        if self.keys["left"]:
            self.vx = -self.SPEED
        elif self.keys["right"]:
            self.vx = self.SPEED
        else:
            self.vx *= 0.78

        self.vy += self.GRAVITY
        self.px += self.vx
        self.py += self.vy
        self.px = max(0, min(self.px, self.W - 52))

        self.on_ground = False
        for px, py2, pw, ph in self.platforms:
            if self.px + 50 > px and self.px < px + pw and self.py + 62 > py2 and self.py + 62 < py2 + ph + self.vy + 2 and self.vy >= 0:
                self.py = py2 - 62
                self.vy = 0
                self.on_ground = True

        for i, (cx, cy) in enumerate(self.coins):
            if i not in self.collected:
                if abs(self.px + 26 - cx) < 28 and abs(self.py + 31 - cy) < 28:
                    self.collected.add(i)
                    self.score_var.set(f"🪙 {len(self.collected)} / {len(self.coins)}")

        self.step = (self.step + 1) % 60

    def _draw(self):
        cv = self.cv
        cv.delete("all")

        for i in range(self.H):
            shade = int(26 + i * 0.05)
            color = f"#{shade:02x}{shade+10:02x}{64:02x}"
            cv.create_line(0, i, self.W, i, fill=color)
        
        for px, py2, pw, ph in self.platforms:
            if px < self.W + 50:
                cv.create_rectangle(px, py2, px + pw, py2 + ph, fill="#2d5a1b", outline="#3a7a22", width=2)
                cv.create_rectangle(px, py2, px + pw, py2 + 6, fill="#4a9a30", outline="")

        for i, (cx, cy) in enumerate(self.coins):
            if i not in self.collected:
                pulse = 1 + 0.1 * (1 + abs((self.step % 40) - 20)) / 20
                size = int(12 * pulse)
                cv.create_oval(cx - size, cy - size, cx + size, cy + size, fill="#FFD700", outline="#FFA500", width=2)

        bx, by = int(self.px), int(self.py)
        t = self.step
        rc = lambda o=0: RAINBOW[(t // 10 + o) % len(RAINBOW)]

        cv.create_oval(bx, by + 20, bx + 52, by + 62, fill=rc(0), outline=rc(1), width=2)
        cv.create_oval(bx + 4, by - 4, bx + 48, by + 32, fill=rc(1), outline=rc(2), width=2)

        cv.create_text(12, 12, anchor="nw", text=f"Монеты: {len(self.collected)}/{len(self.coins)}", fill="white", font=("Segoe UI", 12, "bold"))

BASEPLATE_TEMPLATE = {
    "name": "Baseplate",
    "objects": [
        {"type": "Блок", "x": 0, "y": 760, "w": 2000, "h": 40, "color": "#4a9a30"},
        {"type": "Спавн", "x": 80, "y": 680, "w": 40, "h": 40, "color": "#00b2ff"},
    ]
}

TOOLS_LIST = ["Выбор", "Блок", "Спавн", "Монета", "Враг", "Ластик"]
BLOCK_COLORS = {"Блок": "#4a9a30", "Спавн": "#00b2ff", "Монета": "#FFD700", "Враг": "#e74c3c"}

class ExiStudio:
    CW, CH = 920, 520
    TILE = 40

    def __init__(self, app, master):
        self.app = app
        self.win = tk.Toplevel(master)
        self.win.title("✦ ExiStudio")
        self.win.geometry("1160x680")
        self.win.configure(bg=C("bg_dark"))

        self.tool = tk.StringVar(value="Блок")
        self.sel_color = "#4a9a30"
        self.objects = []
        self.sel_obj = None
        self.dragging = None
        self.proj_name = "Новый проект"

        self._build()
        self._load_baseplate()
        self._redraw()

    def _build(self):
        mbar = tk.Frame(self.win, bg="#111", height=38)
        mbar.pack(fill="x")
        mbar.pack_propagate(False)
        
        for txt, cmd in [("📤 Publish", self._publish_dialog), ("💾 Сохранить", self._save), ("📂 Загрузить", self._load), ("🏗 Baseplate", self._load_baseplate), ("▶ Тест", self._test), ("🗑 Очистить", self._clear)]:
            mk_btn(mbar, txt, cmd, bg="#1e2030", fg=C("text"), h=1, px=14, py=5, font=("Segoe UI", 10, "bold")).pack(side="left", padx=2, pady=4)
        
        self.name_var = tk.StringVar(value=self.proj_name)
        ne = tk.Entry(mbar, textvariable=self.name_var, font=("Segoe UI", 11, "bold"), bg="#1e2030", fg=C("accent"), relief="flat", bd=6, width=24, insertbackground=C("accent"))
        ne.pack(side="left", padx=16, pady=4)

        main = tk.Frame(self.win, bg=C("bg_dark"))
        main.pack(fill="both", expand=True)

        panel = tk.Frame(main, bg=C("sidebar"), width=132)
        panel.pack(side="left", fill="y")
        panel.pack_propagate(False)
        lbl(panel, "🛠 Инструменты", font=("Segoe UI", 10, "bold"), bg=C("sidebar"), fg=C("subtext")).pack(pady=(14, 6))
        self._tbtn = {}
        for tool in TOOLS_LIST:
            def make(t=tool):
                self.tool.set(t)
                if t in BLOCK_COLORS:
                    self.sel_color = BLOCK_COLORS[t]
                    self.col_prev.configure(bg=self.sel_color)
                self._refresh_btns()
            b = tk.Button(panel, text=tool, font=("Segoe UI", 10), bg=C("bg_light") if tool == self.tool.get() else C("bg_dark"), fg=C("text"), relief="flat", cursor="hand2", width=13, height=2, command=make)
            b.pack(pady=3)
            self._tbtn[tool] = b

        lbl(panel, "🎨 Цвет", font=("Segoe UI", 10, "bold"), bg=C("sidebar"), fg=C("subtext")).pack(pady=(14, 5))
        self.col_prev = tk.Frame(panel, bg=self.sel_color, width=60, height=30, cursor="hand2", highlightthickness=1, highlightbackground=C("border"))
        self.col_prev.pack()
        self.col_prev.bind("<Button-1>", self._pick_color)

        lbl(panel, "📋 Объекты", font=("Segoe UI", 10, "bold"), bg=C("sidebar"), fg=C("subtext")).pack(pady=(14, 5))
        self.obj_lb = tk.Listbox(panel, bg=C("bg_input"), fg=C("text"), font=("Segoe UI", 9), relief="flat", bd=0, selectbackground=C("accent"), selectforeground=C("text"), height=10, width=15)
        self.obj_lb.pack(padx=6, fill="x")
        self.obj_lb.bind("<ButtonRelease-1>", self._sel_list)

        cf = tk.Frame(main, bg=C("bg_dark"))
        cf.pack(fill="both", expand=True, padx=8, pady=8)
        self.cv = tk.Canvas(cf, width=self.CW, height=self.CH, bg="#1a2040", highlightthickness=1, highlightbackground=C("accent"), cursor="crosshair")
        hb = tk.Scrollbar(cf, orient="horizontal", command=self.cv.xview)
        vb = tk.Scrollbar(cf, orient="vertical", command=self.cv.yview)
        self.cv.configure(xscrollcommand=hb.set, yscrollcommand=vb.set, scrollregion=(0, 0, 2000, 800))
        self.cv.grid(row=0, column=0, sticky="nsew")
        vb.grid(row=0, column=1, sticky="ns")
        hb.grid(row=1, column=0, sticky="ew")
        cf.rowconfigure(0, weight=1)
        cf.columnconfigure(0, weight=1)

        self.cv.bind("<Button-1>", self._click)
        self.cv.bind("<B1-Motion>", self._drag)
        self.cv.bind("<ButtonRelease-1>", lambda e: setattr(self, "dragging", None))
        self.cv.bind("<Button-3>", self._right_click)

        self.status = tk.StringVar(value="Готов к работе")
        lbl(self.win, textvariable=self.status, font=("Segoe UI", 9), fg=C("subtext"), bg=C("bg_dark"), anchor="w").pack(fill="x", padx=8, pady=2)

    def _load_baseplate(self):
        self.objects = [obj.copy() for obj in BASEPLATE_TEMPLATE["objects"]]
        self.proj_name = "Baseplate"
        self.name_var.set(self.proj_name)
        self._redraw()
        self._upd_list()
        self.status.set("Baseplate загружен!")

    def _publish_dialog(self):
        if self.app.me.get("is_guest"):
            messagebox.showinfo("Недоступно", "Гости не могут публиковать игры!", parent=self.win)
            return
        
        dlg = tk.Toplevel(self.win)
        dlg.title("📤 Publish Game")
        dlg.geometry("480x420")
        dlg.configure(bg=C("bg_mid"))
        dlg.resizable(False, False)
        
        lbl(dlg, "📤 Опубликовать игру", font=("Segoe UI", 18, "bold"), bg=C("bg_mid")).pack(pady=20)
        
        f = tk.Frame(dlg, bg=C("bg_mid"))
        f.pack(pady=10, padx=30, fill="both", expand=True)
        
        lbl(f, "Название игры", font=("Segoe UI", 11, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 5))
        nc, name_entry = mk_entry(f, w=40)
        nc.pack(pady=(0, 16))
        name_entry.insert(0, "Untitled Game")
        name_entry.focus()
        
        lbl(f, "Описание", font=("Segoe UI", 11, "bold"), bg=C("bg_mid")).pack(anchor="w", pady=(0, 5))
        desc_text = scrolledtext.ScrolledText(f, font=("Segoe UI", 11), bg=C("bg_input"), fg=C("text"), relief="flat", wrap="word", height=6, width=40)
        desc_text.pack(pady=(0, 16))
        desc_text.insert("1.0", "Описание вашей удивительной игры...")
        
        def do_publish():
            name = name_entry.get().strip() or "Untitled Game"
            description = desc_text.get("1.0", "end-1c").strip() or "Без описания"
            
            project_data = {"objects": self.objects, "version": 1}
            game_id, msg = self.app.publish_game(name, description, project_data)
            
            if game_id:
                messagebox.showinfo("Успех! 🎉", f"Игра '{name}' опубликована!", parent=dlg)
                dlg.destroy()
                self.status.set(f"Игра '{name}' опубликована!")
            else:
                messagebox.showerror("Ошибка", msg, parent=dlg)
        
        btn_frame = tk.Frame(f, bg=C("bg_mid"))
        btn_frame.pack()
        mk_btn(btn_frame, "🚀 Опубликовать", do_publish, bg=C("green"), w=18, h=1, py=10).pack(side="left", padx=5)
        mk_btn(btn_frame, "Отмена", dlg.destroy, bg=C("bg_input"), w=12, h=1, py=10).pack(side="left", padx=5)

    def _refresh_btns(self):
        for t, b in self._tbtn.items():
            b.configure(bg=C("bg_light") if t == self.tool.get() else C("bg_dark"))

    def _cpos(self, event):
        return self.cv.canvasx(event.x), self.cv.canvasy(event.y)

    def _snap(self, x, y):
        return (int(x) // self.TILE) * self.TILE, (int(y) // self.TILE) * self.TILE

    def _click(self, event):
        cx, cy = self._cpos(event)
        tool = self.tool.get()
        if tool == "Ластик":
            for obj in self.objects[:]:
                if obj["x"] <= cx <= obj["x"] + obj["w"] and obj["y"] <= cy <= obj["y"] + obj["h"]:
                    self.objects.remove(obj)
                    self._redraw()
                    self._upd_list()
                    return
        elif tool == "Выбор":
            self.sel_obj = None
            for obj in reversed(self.objects):
                if obj["x"] <= cx <= obj["x"] + obj["w"] and obj["y"] <= cy <= obj["y"] + obj["h"]:
                    self.sel_obj = obj
                    self.dragging = (cx - obj["x"], cy - obj["y"])
                    break
            self._redraw()
        else:
            sx, sy = self._snap(cx, cy)
            self.objects.append({"type": tool, "x": sx, "y": sy, "w": self.TILE, "h": self.TILE, "color": self.sel_color})
            self._redraw()
            self._upd_list()

    def _drag(self, event):
        if self.tool.get() == "Выбор" and self.sel_obj and self.dragging:
            cx, cy = self._cpos(event)
            dx, dy = self.dragging
            sx, sy = self._snap(cx - dx, cy - dy)
            self.sel_obj["x"], self.sel_obj["y"] = sx, sy
            self._redraw()

    def _right_click(self, event):
        cx, cy = self._cpos(event)
        for obj in reversed(self.objects):
            if obj["x"] <= cx <= obj["x"] + obj["w"] and obj["y"] <= cy <= obj["y"] + obj["h"]:
                self.objects.remove(obj)
                self._redraw()
                self._upd_list()
                return

    def _sel_list(self, event):
        idx = self.obj_lb.curselection()
        if idx:
            self.sel_obj = self.objects[idx[0]]
            self._redraw()

    def _pick_color(self, _):
        res = colorchooser.askcolor(self.sel_color, parent=self.win, title="Цвет блока")
        if res[1]:
            self.sel_color = res[1]
            self.col_prev.configure(bg=self.sel_color)

    def _redraw(self):
        cv = self.cv
        cv.delete("all")
        
        for i in range(800):
            shade = int(26 + i * 0.05)
            color = f"#{shade:02x}{shade+10:02x}{64:02x}"
            cv.create_line(0, i, 2000, i, fill=color)
        
        for gx in range(0, 2001, self.TILE):
            cv.create_line(gx, 0, gx, 800, fill="#ffffff08")
        for gy in range(0, 801, self.TILE):
            cv.create_line(0, gy, 2000, gy, fill="#ffffff08")
        
        for obj in self.objects:
            ox, oy, ow, oh = obj["x"], obj["y"], obj["w"], obj["h"]
            sel = obj is self.sel_obj
            cv.create_rectangle(ox, oy, ox + ow, oy + oh, fill=obj.get("color", "#4a9a30"), outline="#ffffff" if sel else "#00000055", width=3 if sel else 1)

    def _upd_list(self):
        self.obj_lb.delete(0, "end")
        for i, obj in enumerate(self.objects):
            self.obj_lb.insert("end", f"{i+1}. {obj['type']}")

    def _save(self):
        name = self.name_var.get().strip() or "Без названия"
        self.app.save_project(name, {"objects": self.objects, "version": 1})
        self.status.set(f"Сохранено: {name}")

    def _load(self):
        projects = self.app.me.get("studio_projects", [])
        if not projects:
            messagebox.showinfo("Пусто", "Нет проектов.", parent=self.win)
            return
        dlg = tk.Toplevel(self.win)
        dlg.title("Загрузить проект")
        dlg.geometry("340x300")
        dlg.configure(bg=C("bg_mid"))
        lb = tk.Listbox(dlg, bg=C("bg_input"), fg=C("text"), font=("Segoe UI", 11), relief="flat", bd=0, height=8, width=30)
        lb.pack(padx=20, pady=20)
        for p in projects:
            lb.insert("end", p["name"])

        def do_load():
            sel = lb.curselection()
            if not sel:
                return
            proj = projects[sel[0]]
            self.objects = proj["data"].get("objects", [])
            self._redraw()
            self._upd_list()
            dlg.destroy()

        mk_btn(dlg, "Загрузить", do_load, w=16, h=1, py=8).pack(pady=12)

    def _test(self):
        game = {"name": f"Тест: {self.name_var.get()}", "icon": "🛠", "playable": True, "color": "#2a2d50", "objects": self.objects}
        GameScene(self.app, game, self.win)

    def _clear(self):
        if messagebox.askyesno("Очистить", "Удалить все объекты?", parent=self.win):
            self.objects = []
            self._redraw()
            self._upd_list()

if __name__ == "__main__":
    try:
        app = App()
        LoginWin(app).run()
    except Exception as e:
        print(f"Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()
