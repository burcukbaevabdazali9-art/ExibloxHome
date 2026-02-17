// ╔══════════════════════════════════════════════════════╗
// ║     EXIAN.AI 3.0 — Neural Network Engine            ║
// ║     ExiWin 12 | C++17 | MIT License                 ║
// ╚══════════════════════════════════════════════════════╝
// Компиляция: g++ -std=c++17 -O2 ExianAI.cpp -o ExianAI

#include <iostream>
#include <vector>
#include <cmath>
#include <random>
#include <algorithm>
#include <fstream>
#include <iomanip>
#include <string>
#include <functional>
#include <chrono>

using namespace std;

// ═══════════════════════════════════════
// ФУНКЦИИ АКТИВАЦИИ
// ═══════════════════════════════════════
namespace Act {
    double sigmoid(double x)   { return 1.0/(1.0+exp(-x)); }
    double sigmoid_d(double y) { return y*(1.0-y); }
    double relu(double x)      { return x>0?x:0; }
    double relu_d(double x)    { return x>0?1.0:0.0; }
    double tanh_a(double x)    { return tanh(x); }
    double tanh_d(double y)    { return 1.0-y*y; }
}

// ═══════════════════════════════════════
// СЛОЙ
// ═══════════════════════════════════════
struct Layer {
    int in_n, out_n;
    vector<vector<double>> W, mW, vW;
    vector<double> b, mb, vb, out, delta;
    function<double(double)> fn, fd;
    string act;

    Layer(int in, int out, const string& activation="sigmoid")
        : in_n(in), out_n(out), act(activation)
    {
        mt19937 gen(chrono::steady_clock::now().time_since_epoch().count());
        double sc = sqrt(2.0/in);
        uniform_real_distribution<> d(-sc, sc);
        W.assign(out, vector<double>(in));
        for(auto& r:W) for(auto& w:r) w=d(gen);
        b.assign(out,0); out.assign(out,0); delta.assign(out,0);
        mW.assign(out,vector<double>(in,0)); vW.assign(out,vector<double>(in,0));
        mb.assign(out,0); vb.assign(out,0);
        setAct(activation);
    }

    void setAct(const string& a) {
        act=a;
        if(a=="relu")       { fn=Act::relu;    fd=Act::relu_d; }
        else if(a=="tanh")  { fn=Act::tanh_a;  fd=Act::tanh_d; }
        else                { fn=Act::sigmoid;  fd=Act::sigmoid_d; }
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

// ═══════════════════════════════════════
// НЕЙРОСЕТЬ
// ═══════════════════════════════════════
class ExianNet {
    vector<Layer> L;
    double lr; int t=0;
    const double b1=0.9,b2=0.999,ep=1e-8;
public:
    int epochs=0;

    ExianNet(vector<pair<int,string>> arch, double lr=0.001): lr(lr) {
        for(size_t i=1;i<arch.size();i++)
            L.emplace_back(arch[i-1].first, arch[i].first, arch[i].second);
        cout<<"🤖 ExianNet | Слоёв: "<<L.size()<<" | lr="<<lr<<"\n";
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
                for(int m=0;m<L[k+1].out_n;m++) e+=L[k+1].delta[m]*L[k+1].W[m][j];
                L[k].delta[j]=e*L[k].fd(A[k+1][j]);
            }
        for(int k=0;k<n;k++)
            for(int i=0;i<L[k].out_n;i++){
                auto adam=[&](double& p,double& m,double& v,double g){
                    m=b1*m+(1-b1)*g; v=b2*v+(1-b2)*g*g;
                    p-=lr*(m/(1-pow(b1,t)))/(sqrt(v/(1-pow(b2,t)))+ep);
                };
                adam(L[k].b[i],L[k].mb[i],L[k].vb[i],L[k].delta[i]);
                for(int j=0;j<L[k].in_n;j++)
                    adam(L[k].W[i][j],L[k].mW[i][j],L[k].vW[i][j],L[k].delta[i]*A[k][j]);
            }
    }

    double train(const vector<vector<double>>& X, const vector<vector<double>>& Y,
                 int ep_count, int print_step=500){
        cout<<"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        cout<<"  Обучение: "<<ep_count<<" эпох\n";
        cout<<"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        double loss=0;
        for(int e=0;e<ep_count;e++){
            loss=0; int ok=0;
            for(size_t i=0;i<X.size();i++){
                auto p=forward(X[i]); backward(X[i],Y[i]);
                for(size_t j=0;j<p.size();j++){ double d=p[j]-Y[i][j]; loss+=d*d; }
                if((p[0]>=0.5)==(Y[i][0]>=0.5)) ok++;
            }
            loss/=X.size();
            if(e%print_step==0||e==ep_count-1)
                cout<<"  Эпоха "<<setw(5)<<e<<" | MSE: "<<fixed<<setprecision(6)<<loss
                    <<" | Точность: "<<setprecision(1)<<100.0*ok/X.size()<<"%\n";
            epochs++;
        }
        cout<<"✅ Готово!\n";
        return loss;
    }

    vector<double> predict(const vector<double>& x){ return forward(x); }

    void info(){
        int p=0; for(auto& l:L) p+=l.in_n*l.out_n+l.out_n;
        cout<<"\n╔═══════════════════════════════╗\n";
        cout<<"║  ExianAI 3.0 — Модель         ║\n";
        cout<<"╠═══════════════════════════════╣\n";
        cout<<"║  Слоёв:      "<<setw(17)<<L.size()<<" ║\n";
        cout<<"║  Параметров: "<<setw(17)<<p<<" ║\n";
        cout<<"║  Эпох:       "<<setw(17)<<epochs<<" ║\n";
        cout<<"║  LR:         "<<setw(17)<<lr<<" ║\n";
        cout<<"╚═══════════════════════════════╝\n";
    }

    void save(const string& f){
        ofstream os(f);
        os<<"ExianAI_v3\n"<<L.size()<<"\n";
        for(auto& l:L){
            os<<l.in_n<<" "<<l.out_n<<" "<<l.act<<"\n";
            for(auto& r:l.W){ for(double w:r) os<<w<<" "; os<<"\n"; }
            for(double b_:l.b) os<<b_<<" "; os<<"\n";
        }
        cout<<"💾 Сохранено: "<<f<<"\n";
    }
};

// ═══════════════════════════════════════
// ДЕМОНСТРАЦИИ
// ═══════════════════════════════════════
void demo_xor(){
    cout<<"\n🔷 ДЕМО 1: XOR\n";
    ExianNet net({{2,"sigmoid"},{8,"relu"},{4,"relu"},{1,"sigmoid"}},0.005);
    vector<vector<double>> X={{0,0},{0,1},{1,0},{1,1}};
    vector<vector<double>> Y={{0},{1},{1},{0}};
    net.train(X,Y,3000,600);
    cout<<"\n  Ввод → Ожидание → ExianAI\n";
    for(size_t i=0;i<X.size();i++){
        auto p=net.predict(X[i]);
        cout<<"  ["<<(int)X[i][0]<<","<<(int)X[i][1]<<"] → "<<(int)Y[i][0]
            <<" → "<<fixed<<setprecision(4)<<p[0]
            <<(abs(p[0]-Y[i][0])<0.2?" ✅":" ⚠️")<<"\n";
    }
}

void demo_pattern(){
    cout<<"\n🔷 ДЕМО 2: Классификация паттернов\n";
    ExianNet net({{4,"sigmoid"},{16,"relu"},{8,"relu"},{2,"sigmoid"}},0.003);
    vector<vector<double>> X={{1,0,0,0},{0,1,0,0},{0,0,1,0},{0,0,0,1},
                               {1,1,0,0},{0,1,1,0},{0,0,1,1},{1,0,0,1}};
    vector<vector<double>> Y={{1,0},{1,0},{1,0},{1,0},{0,1},{0,1},{0,1},{0,1}};
    net.train(X,Y,4000,1000);
    net.info();
    for(size_t i=0;i<X.size();i++){
        auto p=net.predict(X[i]);
        string pred=p[0]>p[1]?"A":"B", exp=Y[i][0]>Y[i][1]?"A":"B";
        cout<<"  ["<<X[i][0]<<X[i][1]<<X[i][2]<<X[i][3]<<"] → Класс "
            <<pred<<(pred==exp?" ✅":" ❌")<<"\n";
    }
    net.save("exian_pattern.dat");
}

void demo_sin(){
    cout<<"\n🔷 ДЕМО 3: Аппроксимация sin(x)\n";
    ExianNet net({{1,"sigmoid"},{32,"tanh"},{16,"tanh"},{1,"tanh"}},0.002);
    const double PI=3.14159265;
    vector<vector<double>> X,Y;
    for(int i=0;i<50;i++){
        double x=-PI+(2*PI*i/49.0);
        X.push_back({x/PI}); Y.push_back({sin(x)});
    }
    net.train(X,Y,5000,1000);
    cout<<"\n  x → sin(x) vs ExianAI\n";
    for(int i=0;i<8;i++){
        int idx=i*6;
        double xr=-PI+(2*PI*idx/49.0);
        auto p=net.predict(X[idx]);
        double err=abs(p[0]-Y[idx][0]);
        cout<<"  x="<<fixed<<setprecision(2)<<setw(5)<<xr
            <<" | sin="<<setprecision(4)<<setw(7)<<Y[idx][0]
            <<" | AI="<<setw(7)<<p[0]
            <<" | err="<<setprecision(4)<<err<<"\n";
    }
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════
int main(int argc, char* argv[]){
    cout<<"\n";
    cout<<"  ███████╗██╗  ██╗██╗ █████╗ ███╗  ██╗   █████╗ ██╗\n";
    cout<<"  ██╔════╝╚██╗██╔╝██║██╔══██╗████╗ ██║ ██╔══██╗██║\n";
    cout<<"  █████╗   ╚███╔╝ ██║███████║██╔██╗██║ ███████║██║\n";
    cout<<"  ██╔══╝   ██╔██╗ ██║██╔══██║██║╚████║ ██╔══██║██║\n";
    cout<<"  ███████╗██╔╝██╗ ██║██║  ██║██║ ╚███║ ██║  ██║██║\n";
    cout<<"  ╚══════╝╚═╝ ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚══╝ ╚═╝  ╚═╝╚═╝\n";
    cout<<"              версия 3.0  |  ExiWin 12\n\n";
    cout<<"Режим: [1] XOR  [2] Паттерны  [3] sin(x)  [0] Все\n> ";
    int c=0;
    if(argc>1) c=atoi(argv[1]); else cin>>c;
    switch(c){
        case 1: demo_xor(); break;
        case 2: demo_pattern(); break;
        case 3: demo_sin(); break;
        default: demo_xor(); demo_pattern(); demo_sin();
    }
    cout<<"\n✨ ExianAI 3.0 — ExiWin 12\n\n";
    return 0;
}
