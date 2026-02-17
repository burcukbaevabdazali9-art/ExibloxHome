text

"""
Exiblox v3 — ПОЛНАЯ ВЕРСИЯ (ПЕРЕПИСАННАЯ)
  ✨ Новые функции:
  - 📤 Publish Tab — публикация игр
  - 🤖 AI Assistant — умный помощник
  - 👤 Гостевой вход
  - 🌈 Радужный курсор
  - 🔄 Автовход в последний аккаунт
  - 🎮 Система публикации игр (исправлена)
  - 🔍 Поиск по имени игры
  - 🏗 Baseplate шаблон в Studio
  - ⭐ Улучшенная физика и графика
  - 🎨 Мгновенное переключение тем
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


# ════════════════════════════════════════════
# RAINBOW CURSOR
# ════════════════════════════════════════════
class RainbowCursor:
    """Rainbow trailing cursor effect for tkinter windows."""
    COLORS = ["#ff0000", "#ff5500", "#ffaa00", "#ffff00", "#00cc44", "#0077ff", "#6600cc", "#cc00ff"]
    MAX_TRAIL = 10

    def __init__(self, root):
        self.root = root
        self.trail = []  # list of (x, y) relative to root
        self.ci = 0
        # Create dot labels that follow cursor
        self.dots = []
        for i in range(self.MAX_TRAIL):
            dot = tk.Label(root, text="●", font=("Arial", 7),
                           fg=self.COLORS[i % len(self.COLORS)],
                           bg=C("bg_mid"), bd=0, highlightthickness=0)
            dot.place(x=-20, y=-20)
            self.dots.append(dot)
        root.bind_all("<Motion>", self._on_motion)

    def _on_motion(self, event):
        # Get position relative to root window
        try:
            x = event.x_root - self.root.winfo_rootx()
            y = event.y_root - self.root.winfo_rooty()
            self.trail.insert(0, (x, y))
            if len(self.trail) > self.MAX_TRAIL:
                self.trail.pop()
            for i, (tx, ty) in enumerate(self.trail):
                if i < len(self.dots):
                    offset = i * 2
                    self.dots[i].place(x=tx - 4 + offset // 3, y=ty - 4)
                    self.dots[i].lift()
            # Hide unused dots
            for i in range(len(self.trail), len(self.dots)):
                self.dots[i].place(x=-20, y=-20)
        except Exception:
            pass


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
        # Ensure objects are properly saved for gameplay
        objects = project_data.get("objects", [])
        # Make sure each object has required fields
        clean_objects = []
        for obj in objects:
            clean_obj = {
                "type": obj.get("type", "Блок"),
                "x": int(obj.get("x", 0)),
                "y": int(obj.get("y", 0)),
                "w": int(obj.get("w", 40)),
                "h": int(obj.get("h", 40)),
                "color": obj.get("color", "#4a9a30")
            }
            clean_objects.append(clean_obj)

        game = {
            "id": game_id,
            "name": name,
            "description": description,
            "author": self.current_user,
            "objects": clean_objects,
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "icon": random.choice(["🎮", "🎯", "🏆", "⚡", "🌟", "🔥", "💎", "🎲"]),
            "color": random.choice(["#7c3aed", "#1a6fa8", "#b8860b", "#ba5a00", "#8b0000", "#3a4a5a", "#2d5a1b"]),
            "rating": f"{random.randint(70,100)}%",
            "players": str(random.randint(0, 999)),
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
        RainbowCursor(self.win)
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
        RainbowCursor(self.win)
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
        self._rainbow = RainbowCursor(self.win)

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

        # Main content
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

        # Show ALL published games so they're always playable from Home
        all_games = self.app.published_games
        if all_games:
            self._game_section(inn, "🎮 Играть сейчас", all_games[:4])
            if len(all_games) > 4:
                self._game_section(inn, "⭐ Популярные", all_games[4:8])
            if len(all_games) > 8:
                self._game_section(inn, "🆕 Новинки", all_games[8:12])
        else:
            lbl(inn, "Пока нет опубликованных игр...\nСоздайте и опубликуйте игру в Studio!", fg=C("subtext"), font=("Segoe UI", 14), bg=C("bg_mid")).pack(anchor="w", padx=30, pady=20)

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
        card = tk.Frame(p, bg=C("bg_light"), width=210, height=290, cursor="hand2",
                        highlightthickness=1, highlightbackground=C("border"))
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

        # Play button
        play_btn = tk.Button(inf, text="▶ Играть", font=("Segoe UI", 9, "bold"),
                             bg=C("accent"), fg="#fff", relief="flat", cursor="hand2",
                             command=lambda gg=g: self._play_game(gg))
        play_btn.pack(fill="x", pady=(4, 0))

        def click(e, gg=g):
            self._play_game(gg)

        for w in (card, th, ico):
            w.bind("<Button-1>", click)

    def _play_game(self, g):
        """Launch a game - works for ALL published games."""
        if not g.get("playable", True):
            messagebox.showinfo("Недоступно", "Игра недоступна.", parent=self.win)
            return
        try:
            GameScene(self.app, g, self.win)
        except Exception as e:
            messagebox.showerror("Ошибка", f"Не удалось запустить игру: {e}", parent=self.win)

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
                # Play button in charts
                play = tk.Button(row, text="▶ Играть", font=("Segoe UI", 9, "bold"),
                                 bg=C("accent"), fg="#fff", relief="flat", cursor="hand2",
                                 command=lambda gg=g: self._play_game(gg))
                play.pack(side="right", padx=10, pady=8)
                lbl(row, f"👥 {g.get('players', '0')}", fg=C("subtext"), font=("Segoe UI", 10), bg=C("bg_light")).pack(side="right", padx=20)
                lbl(row, f"👍 {g.get('rating', '0%')}", fg=C("green"), font=("Segoe UI", 10, "bold"), bg=C("bg_light")).pack(side="right", padx=8)
        else:
            lbl(inn, "Нет опубликованных игр", fg=C("subtext"), font=("Segoe UI", 14), bg=C("bg_mid")).pack(pady=40)

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
            # Show all pages of games
            if len(my_games) > 4:
                for start in range(4, len(my_games), 4):
                    self._game_section(inn, "", my_games[start:start+4])
        else:
            lbl(inn, "У вас пока нет опубликованных игр.\nСоздайте игру в Studio и опубликуйте её!", fg=C("subtext"), font=("Segoe UI", 14), bg=C("bg_mid")).pack(anchor="w", padx=30, pady=20)
            mk_btn(inn, "🛠 Открыть Studio", self._studio, bg=C("accent"), w=20, h=1, py=10).pack(padx=30, pady=10, anchor="w")

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
        """Theme selection with INSTANT application (no restart needed)."""
        global CURRENT_THEME
        f = tk.Frame(self.content, bg=C("bg_mid"))
        f.pack(expand=True)
        lbl(f, "🎨 Выберите тему", font=("Segoe UI", 26, "bold"), bg=C("bg_mid")).pack(pady=(50, 10))
        lbl(f, "Тема применяется мгновенно!", fg=C("green"), bg=C("bg_mid")).pack(pady=(0, 35))
        cf = tk.Frame(f, bg=C("bg_mid"))
        cf.pack()
        themes_info = [
            ("dark",  "🌙", "Тёмная",       "Классический тёмный", "#1a1c1e", "#ffffff"),
            ("light", "☀️", "Светлая",      "Чистый белый",        "#f0f2f5", "#1a1a1a"),
            ("bw",    "◐",  "Чёрно-белая",  "Монохромный стиль",   "#111111", "#ffffff"),
        ]

        def apply_theme(t):
            global CURRENT_THEME
            if CURRENT_THEME == t:
                return
            CURRENT_THEME = t
            # Save theme to user profile
            if self.app.current_user and self.app.current_user in self.app.users:
                self.app.users[self.app.current_user]["theme"] = t
                self.app._save()
            # Save to config
            self.app.config["theme"] = t
            self.app._save_config()
            # INSTANT APPLY: Destroy and recreate MainWin with new theme
            self.win.destroy()
            MainWin(self.app)

        for tid, icon, name, desc, bg, fg in themes_info:
            active = tid == CURRENT_THEME
            card = tk.Frame(cf, bg=bg, width=200, height=230, cursor="hand2",
                            highlightthickness=3 if active else 1,
                            highlightbackground=C("accent") if active else C("border"))
            card.pack(side="left", padx=15)
            card.pack_propagate(False)
            tk.Label(card, text=icon, font=("Segoe UI", 40), bg=bg, fg=fg).pack(pady=(28, 6))
            tk.Label(card, text=name, font=("Segoe UI", 14, "bold"), bg=bg, fg=fg).pack()
            tk.Label(card, text=desc, font=("Segoe UI", 9), bg=bg, fg=fg, wraplength=170).pack(pady=5)
            if active:
                tk.Label(card, text="✓ Активна", font=("Segoe UI", 10, "bold"), bg=bg, fg="#00b2ff").pack()
            else:
                btn = tk.Button(card, text="Применить", font=("Segoe UI", 10),
                                bg="#00b2ff", fg="#fff", relief="flat", cursor="hand2",
                                command=lambda t=tid: apply_theme(t))
                btn.pack(pady=6)

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
            return "1. Открой вкладку 'Studio' (🛠)\n2. Выбери инструмент\n3. Размещай объекты\n4. Нажми 'Publish' — игра появится на Home и Charts!"
        elif "baseplate" in q or "басплейт" in q:
            return "Baseplate - стартовый шаблон с платформой и точкой спавна!"
        elif "публик" in q:
            return "Нажми 'Publish' в Studio, введи название и описание. Игра сразу появится на вкладках Home и Charts и будет доступна для игры!"
        elif "тем" in q:
            return "Зайди в вкладку 'Themes' (🎨) и выбери тему. Она применяется мгновенно!"
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

        info = [f"💰  {me.get('robux', 0)} R$", f"👥  Друзей: {len(me.get('frie
