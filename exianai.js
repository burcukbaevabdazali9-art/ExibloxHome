'use strict';

// ════════════════════════════════════════════
// EXIAN.AI 3.0 — IDE LOGIC
// ════════════════════════════════════════════
let exianCodeChanged_ = false;
let exianModelTrained = false;
let exianTraining = false;

const EXIAN_DEFAULT_CODE = `// ╔══════════════════════════════════════════════════════════╗
// ║     EXIAN.AI 3.0 — Neural Network Engine               ║
// ║     ExiWin 12 | C++17 | Exian Research Labs            ║
// ╚══════════════════════════════════════════════════════════╝
// Компиляция: g++ -std=c++17 -O2 ExianAI.cpp -o ExianAI

#include <iostream>
#include <vector>
#include <cmath>
#include <random>
#include <functional>
using namespace std;

// ─── Функции активации ─────────────────────
namespace Act {
    double sigmoid(double x)   { return 1.0/(1.0+exp(-x)); }
    double sigmoid_d(double y) { return y*(1.0-y); }
    double relu(double x)      { return x>0?x:0; }
    double relu_d(double x)    { return x>0?1.0:0.0; }
    double tanh_a(double x)    { return tanh(x); }
    double tanh_d(double y)    { return 1.0-y*y; }
}

// ─── Слой нейросети ─────────────────────────
struct Layer {
    int in_n, out_n;
    vector<vector<double>> W, mW, vW;
    vector<double> b, mb, vb, out, delta;
    function<double(double)> fn, fd;

    Layer(int in, int out, const string& act="sigmoid")
        : in_n(in), out_n(out)
    {
        mt19937 gen(42); double sc=sqrt(2.0/in);
        uniform_real_distribution<> d(-sc, sc);
        W.assign(out, vector<double>(in));
        for(auto& r:W) for(auto& w:r) w=d(gen);
        b.assign(out,0); out.assign(out,0); delta.assign(out,0);
        mW.assign(out,vector<double>(in,0));
        vW.assign(out,vector<double>(in,0));
        mb.assign(out,0); vb.assign(out,0);
        if(act=="relu") { fn=Act::relu; fd=Act::relu_d; }
        else if(act=="tanh") { fn=Act::tanh_a; fd=Act::tanh_d; }
        else { fn=Act::sigmoid; fd=Act::sigmoid_d; }
    }

    vector<double> forward(const vector<double>& x) {
        for(int i=0;i<out_n;i++){
            double s=b[i];
            for(int j=0;j<in_n;j++) s+=W[i][j]*x[j];
            out[i]=fn(s);
        }
        return out;
    }
};

// ─── Нейросеть с Adam ────────────────────────
class ExianNet {
    vector<Layer> L;
    double lr; int t=0;
    const double b1=0.9, b2=0.999, eps=1e-8;
public:
    ExianNet(vector<pair<int,string>> arch, double lr=0.001): lr(lr) {
        for(size_t i=1;i<arch.size();i++)
            L.emplace_back(arch[i-1].first, arch[i].first, arch[i].second);
    }

    vector<double> forward(const vector<double>& x){
        vector<double> c=x;
        for(auto& l:L) c=l.forward(c);
        return c;
    }

    void backward(const vector<double>& x, const vector<double>& y){
        t++;
        vector<vector<double>> A; A.push_back(x);
        for(auto& l:L) A.push_back(l.forward(A.back()));
        int n=L.size();
        for(int j=0;j<L[n-1].out_n;j++)
            L[n-1].delta[j]=(A[n][j]-y[j])*L[n-1].fd(A[n][j]);
        for(int k=n-2;k>=0;k--)
            for(int j=0;j<L[k].out_n;j++){
                double e=0;
                for(int m=0;m<L[k+1].out_n;m++)
                    e+=L[k+1].delta[m]*L[k+1].W[m][j];
                L[k].delta[j]=e*L[k].fd(A[k+1][j]);
            }
        for(int k=0;k<n;k++)
            for(int i=0;i<L[k].out_n;i++){
                auto adam=[&](double& p,double& m,double& v,double g){
                    m=b1*m+(1-b1)*g; v=b2*v+(1-b2)*g*g;
                    p-=lr*(m/(1-pow(b1,t)))/(sqrt(v/(1-pow(b2,t)))+eps);
                };
                adam(L[k].b[i],L[k].mb[i],L[k].vb[i],L[k].delta[i]);
                for(int j=0;j<L[k].in_n;j++)
                    adam(L[k].W[i][j],L[k].mW[i][j],L[k].vW[i][j],
                         L[k].delta[i]*A[k][j]);
            }
    }

    vector<double> predict(const vector<double>& x){ return forward(x); }
};

// ─── Главная функция ──────────────────────────
int main(){
    // Нейросеть: 2 → 8 → 4 → 1
    ExianNet net({{2,"sigmoid"},{8,"relu"},{4,"relu"},{1,"sigmoid"}}, 0.005);

    // XOR датасет
    vector<vector<double>> X = {{0,0},{0,1},{1,0},{1,1}};
    vector<vector<double>> Y = {{0},{1},{1},{0}};

    cout << "🤖 ExianAI 3.0 — Обучение XOR\\n";

    // Обучение 3000 эпох
    for(int ep=0; ep<3000; ep++){
        for(size_t i=0;i<X.size();i++)
            net.backward(X[i], Y[i]);
        if(ep%500==0){
            double loss=0;
            for(size_t i=0;i<X.size();i++){
                auto p=net.predict(X[i]);
                double d=p[0]-Y[i][0]; loss+=d*d;
            }
            cout << "Эпоха " << ep << " | MSE: " << loss/X.size() << "\\n";
        }
    }

    // Результаты
    cout << "\\n📊 Результаты XOR:\\n";
    for(size_t i=0;i<X.size();i++){
        auto p=net.predict(X[i]);
        cout << "[" << X[i][0] << "," << X[i][1] << "] → " << p[0] << "\\n";
    }
    return 0;
}`;

// ════════════════════════════════════════════
// LOAD / SAVE CODE
// ════════════════════════════════════════════
function loadExianCode(){
  const area = el('exian-code');
  if(!area) return;
  const saved = localStorage.getItem('exiwin_exian_code');
  area.value = saved || EXIAN_DEFAULT_CODE;
  exianUpdateStatus();
}

function saveExianCode(){
  const area = el('exian-code');
  if(area) localStorage.setItem('exiwin_exian_code', area.value);
}

function exianCodeChanged(){
  exianCodeChanged_ = true;
  saveExianCode();
  exianUpdateStatus();
}

function exianUpdateStatus(){
  const area = el('exian-code');
  if(!area) return;
  const lines = area.value.split('\n').length;
  const cp = area.value.substr(0, area.selectionStart);
  const cl = cp.split('\n');
  if(el('exian-stat-ln'))
    el('exian-stat-ln').textContent = `Стр ${cl.length}, Стб ${cl[cl.length-1].length+1} | Строк: ${lines}`;
}

// ════════════════════════════════════════════
// TOOLBAR ACTIONS
// ════════════════════════════════════════════
function exianNewProject(){
  if(exianCodeChanged_ && !confirm('Несохранённые изменения. Создать новый проект?')) return;
  el('exian-code').value=EXIAN_DEFAULT_CODE;
  exianCodeChanged_=false;
  exianModelTrained=false;
  if(el('exian-model-status')) el('exian-model-status').textContent='🤖 Модель не обучена';
  exianTermClear();
  exianTermLine('prompt','Новый проект создан.');
  showNotif('Exian.AI','Новый проект создан','📁');
}

function exianSave(){
  saveExianCode();
  exianCodeChanged_=false;
  showNotif('Exian.AI','Код сохранён','💾');
}

// ════════════════════════════════════════════
// TERMINAL HELPERS
// ════════════════════════════════════════════
function exianTermEl(){
  return el('exian-terminal');
}

function exianTermClear(){
  const t=exianTermEl(); if(t) t.innerHTML='';
}

function exianTermLine(type, text){
  const t=exianTermEl(); if(!t) return;
  const cls = type==='prompt'   ? 'exian-terminal-prompt'
             : type==='success' ? 'exian-terminal-success'
             : type==='error'   ? 'exian-terminal-error'
             : type==='info'    ? 'exian-terminal-info'
             : '';
  const div=document.createElement('div');
  div.className='exian-terminal-line';
  div.innerHTML=cls ? `<span class="${cls}">${text}</span>` : text;
  t.appendChild(div);
  t.scrollTop=t.scrollHeight;
}

function exianTermDelay(fn, ms){ return new Promise(r=>setTimeout(()=>{ fn(); r(); },ms)); }

// ════════════════════════════════════════════
// RUN AI — compile + execute simulation
// ════════════════════════════════════════════
async function exianRunAI(){
  if(exianTraining){ showNotif('Exian.AI','Подождите, идёт обучение...','⏳'); return; }
  exianTermClear();
  exianTermLine('prompt','exian@ai:~$ g++ -std=c++17 -O2 AI_NeuralNetwork.cpp -o ExianAI');
  await exianTermDelay(()=>{},400);
  exianTermLine('info','  Анализ исходного кода...');
  await exianTermDelay(()=>{},500);
  exianTermLine('info','  Оптимизация: -O2 включена');
  await exianTermDelay(()=>{},400);
  exianTermLine('success','✓ Компиляция успешна (0.84s) — 0 ошибок, 0 предупреждений');
  await exianTermDelay(()=>{},300);
  exianTermLine('prompt','exian@ai:~$ ./ExianAI');
  await exianTermDelay(()=>{},400);
  exianTermLine('','');
  exianTermLine('',`  ███████╗██╗  ██╗██╗ █████╗ ███╗  ██╗   █████╗ ██╗`);
  exianTermLine('',`  ╚══███╔╝╚██╗██╔╝██║██╔══██╗████╗ ██║ ██╔══██╗██║`);
  exianTermLine('',`    ███╔╝  ╚███╔╝ ██║███████║██╔██╗██║ ███████║██║`);
  exianTermLine('',`   ███╔╝   ██╔██╗ ██║██╔══██║██║╚████║ ██╔══██║██║`);
  exianTermLine('',`  ███████╗██╔╝ ██╗██║██║  ██║██║ ╚███║ ██║  ██║██║`);
  exianTermLine('',`  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚══╝ ╚═╝  ╚═╝╚═╝`);
  exianTermLine('',`              версия 3.0  |  ExiWin 12`);
  exianTermLine('','');
  await exianTermDelay(()=>{},300);
  exianTermLine('success','🤖 ExianAI 3.0 — Обучение XOR');
  showNotif('Exian.AI','Программа запущена!','▶️');
}

// ════════════════════════════════════════════
// TRAIN MODEL
// ════════════════════════════════════════════
async function exianTrainModel(){
  if(exianTraining){ showNotif('Exian.AI','Обучение уже идёт...','⏳'); return; }
  exianTraining=true;
  exianTermLine('','');
  exianTermLine('info','━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  exianTermLine('info','🎯 Обучение нейросети: 5000 эпох');
  exianTermLine('info','   Архитектура: 2 → 8 → 4 → 1 (Adam lr=0.005)');
  exianTermLine('info','━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if(el('exian-model-status')) el('exian-model-status').textContent='⏳ Обучение...';

  // Реальная нейросеть в JS для демонстрации
  const sig=x=>1/(1+Math.exp(-x));
  const sigD=y=>y*(1-y);
  let W1=Array.from({length:8},()=>Array.from({length:2},()=>(Math.random()-0.5)*2));
  let b1=Array(8).fill(0);
  let W2=Array.from({length:4},()=>Array.from({length:8},()=>(Math.random()-0.5)*2));
  let b2=Array(4).fill(0);
  let W3=Array.from({length:1},()=>Array.from({length:4},()=>(Math.random()-0.5)*2));
  let b3=Array(1).fill(0);

  const X=[[0,0],[0,1],[1,0],[1,1]];
  const Y=[[0],[1],[1],[0]];

  const fwd=inp=>{
    let h1=W1.map((row,i)=>sig(row.reduce((s,w,j)=>s+w*inp[j],0)+b1[i]));
    let h2=W2.map((row,i)=>sig(row.reduce((s,w,j)=>s+w*h1[j],0)+b2[i]));
    let o=W3.map((row,i)=>sig(row.reduce((s,w,j)=>s+w*h2[j],0)+b3[i]));
    return {h1,h2,o};
  };

  let epochs=5000, step=500;
  let epochDone=0;

  const trainBatch=()=>{
    for(let ep=0;ep<step;ep++){
      for(let di=0;di<X.length;di++){
        const {h1,h2,o}=fwd(X[di]);
        const d3=o.map((v,i)=>(v-Y[di][i])*sigD(v));
        const d2=h2.map((_,i)=>sigD(h2[i])*W3.reduce((s,row,k)=>s+row[i]*d3[k],0));
        const d1=h1.map((_,i)=>sigD(h1[i])*W2.reduce((s,row,k)=>s+row[i]*d2[k],0));
        const lr=0.1;
        W3=W3.map((row,i)=>row.map((w,j)=>w-lr*d3[i]*h2[j]));
        b3=b3.map((b,i)=>b-lr*d3[i]);
        W2=W2.map((row,i)=>row.map((w,j)=>w-lr*d2[i]*h1[j]));
        b2=b2.map((b,i)=>b-lr*d2[i]);
        W1=W1.map((row,i)=>row.map((w,j)=>w-lr*d1[i]*X[di][j]));
        b1=b1.map((b,i)=>b-lr*d1[i]);
      }
      epochDone++;
    }
    let mse=X.reduce((s,x,i)=>{ const {o}=fwd(x); return s+(o[0]-Y[i][0])**2; },0)/X.length;
    exianTermLine('',`  Эпоха ${String(epochDone).padStart(5)} | MSE: ${mse.toFixed(8)} | Точность: ${
      Math.round(X.filter((x,i)=>Math.round(fwd(x).o[0])===Y[i][0]).length/X.length*100)}%`);
  };

  for(let i=0;i<epochs/step;i++){
    await exianTermDelay(trainBatch, 250);
  }

  exianModelTrained=true; exianTraining=false;
  if(el('exian-model-status')) el('exian-model-status').textContent='🎯 Модель обучена ✓';
  exianTermLine('success','━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  exianTermLine('success','✅ Обучение завершено! Всего: 5000 эпох');
  showNotif('Exian.AI','Модель успешно обучена!','✅');
}

// ════════════════════════════════════════════
// TEST MODEL
// ════════════════════════════════════════════
function exianTestModel(){
  if(!exianModelTrained){ showNotif('Exian.AI','Сначала обучите модель!','⚠️'); return; }
  exianTermLine('','');
  exianTermLine('info','🧪 ТЕСТИРОВАНИЕ МОДЕЛИ (XOR):');
  exianTermLine('','╔═══════╦═══════╦══════════╦══════════╗');
  exianTermLine('','║ Вход1 ║ Вход2 ║ Ожидание ║  ExianAI ║');
  exianTermLine('','╠═══════╬═══════╬══════════╬══════════╣');
  const r=[['0.0','0.0','0','0.0124'],['0.0','1.0','1','0.9876'],['1.0','0.0','1','0.9891'],['1.0','1.0','0','0.0109']];
  r.forEach(([a,b,e,p])=>{
    exianTermLine('',`║   ${a}  ║   ${b}  ║    ${e}     ║  ${p}  ║`);
  });
  exianTermLine('','╚═══════╩═══════╩══════════╩══════════╝');
  exianTermLine('success','✅ Точность: 100% | Ошибка XOR решена!');
  showNotif('Exian.AI','Тест пройден успешно!','🧪');
}

// ════════════════════════════════════════════
// EXPORT MODEL
// ════════════════════════════════════════════
function exianExportModel(){
  if(!exianModelTrained){ showNotif('Exian.AI','Нет обученной модели!','⚠️'); return; }
  exianTermLine('prompt','exian@ai:~$ Экспорт модели...');
  setTimeout(()=>{
    exianTermLine('success','💾 Модель сохранена: exian_model_xor.dat');
    exianTermLine('','   Формат: ExianAI_v3.0 | Размер: 12.4 KB');
    exianTermLine('','   Слоёв: 3 | Параметров: 57');
    showNotif('Exian.AI','Модель экспортирована!','📤');
  },600);
}

// ════════════════════════════════════════════
// C++ FILE VIEWER (показать ExianAI.cpp)
// ════════════════════════════════════════════
function exianViewCpp(){
  exianTermLine('','');
  exianTermLine('prompt','exian@ai:~$ cat ExianAI.cpp | head -20');
  exianTermLine('info','// EXIAN.AI 3.0 — Neural Network Engine');
  exianTermLine('info','// ExiWin 12 | C++17 | MIT License');
  exianTermLine('','#include <iostream>');
  exianTermLine('','#include <vector>');
  exianTermLine('','#include <cmath>');
  exianTermLine('','#include <functional>');
  exianTermLine('','// ... (350+ строк) ...');
  exianTermLine('success','Открыть полный файл: ExianAI.cpp');
  showNotif('Exian.AI','Просмотр ExianAI.cpp','📄');
}
