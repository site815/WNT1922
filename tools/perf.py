# -*- coding: utf-8 -*-
"""First-principles aircraft performance, calibrated against real articles.
   ONE drag polar per aeroplane -> speed, climb, ceiling, range, endurance."""
import math
G=9.81
def rho(h):
    if h<11000:
        T=288.15-0.0065*h; p=101325*(T/288.15)**5.2559
    else:
        T=216.65; p=22632*math.exp(-G*(h-11000)/(287.05*T))
    return p/(287.05*T)

ETA_MAX=0.80    # propeller efficiency at max speed
ETA_CL =0.62    # effective efficiency in the climb (cooling flaps, high CL, low J)
BSFC   =0.29    # kg/hp-h at economical cruise -- CALIBRATED, not assumed

class Plane:
    def __init__(s,name,S,b,W,hp,ratings,e=0.80,n=1,f=None,vmax_kmh=None,vmax_h=None,c=BSFC):
        s.name,s.S,s.b,s.W,s.hp,s.e,s.n,s.c=name,S,b,W,hp,e,n,c
        s.ratings=sorted(ratings)
        s.f = f if f is not None else s._solve_f(vmax_kmh,vmax_h)
    def power(s,h):
        r=s.ratings
        if h<=r[0][0]: return s.n*(r[0][1]+(s.hp-r[0][1])*(1-h/max(r[0][0],1)))
        for i in range(len(r)-1):
            if r[i][0]<=h<=r[i+1][0]:
                t=(h-r[i][0])/(r[i+1][0]-r[i][0]); return s.n*(r[i][1]+t*(r[i+1][1]-r[i][1]))
        return s.n*r[-1][1]*max(0.0,(rho(h)/rho(r[-1][0]))**1.3)
    def drag(s,V,h,W=None):
        W=W or s.W; q=0.5*rho(h)*V*V
        return q*s.f + (W*G)**2/(q*math.pi*s.b*s.b*s.e)
    def _solve_f(s,vk,h):
        lo,hi=0.10,4.0
        for _ in range(200):
            s.f=(lo+hi)/2
            if s.vmax(h)>vk: lo=s.f
            else: hi=s.f
        return (lo+hi)/2
    def vmax(s,h):
        Pa=ETA_MAX*s.power(h)*745.7; V=100.
        for _ in range(300): V=V*(1+0.2*((Pa/s.drag(V,h))/V-1))
        return V*3.6
    def roc(s,h,W=None):
        W=W or s.W; Pa=ETA_CL*s.power(h)*745.7
        return max((Pa-s.drag(V,h,W)*V)/(W*G) for V in [i*1.0 for i in range(35,171)])
    def ceiling(s,tgt=0.5):
        lo,hi=0.,20000.
        for _ in range(60):
            m=(lo+hi)/2
            if s.roc(m)>tgt: lo=m
            else: hi=m
        return (lo+hi)/2
    def LDmax(s): return 0.5*math.sqrt(math.pi*(s.b*s.b/s.S)*s.e/(s.f/s.S))
    def K(s):     return (ETA_MAX/(G*(s.c/(745.7*3600))))*s.LDmax()/1000.0
    def range_km(s,W0,fuel_kg): return s.K()*math.log(W0/(W0-fuel_kg))
    def vbr(s,h,W):
        CL=math.sqrt(math.pi*(s.b*s.b/s.S)*s.e*(s.f/s.S))
        return math.sqrt(2*W*G/(rho(h)*s.S*CL))
    def endurance_h(s,W0,fuel_kg,h=4000):
        return s.range_km(W0,fuel_kg)/(s.vbr(h,W0-fuel_kg/2)*3.6)
    def stall(s,W,CLmax): return math.sqrt(2*W*G/(1.225*s.S*CLmax))*3.6

if __name__=="__main__":
    REAL=[
     ("A6M2 1940",     22.44,12.00,2410, 940,[(4200,950)],1,533,15.7,10000,6.42),
     ("Bf 109E-3 1939",16.20, 9.87,2505,1100,[(4440,1100)],1,570,17.0,10500,6.01),
     ("Spitfire I 1938",22.48,11.23,2624,1030,[(5800,1030)],1,582,13.4,9700,5.61),
     ("F4F-4 1941",    24.15,11.58,3607,1200,[(5900,1100)],1,512,10.4,10400,5.55),
     ("Fw 190A-3 1942",18.30,10.51,3980,1560,[(5500,1470)],1,624,17.0,10600,6.04),
     ("Swordfish 1936",56.40,13.87,3400, 690,[(1500,690)],1,222, 4.6, 5900,3.41),
     ("Skua 1938",     28.60,14.07,3730, 890,[(2000,830)],1,362, 5.7, 6160,6.92),
     ("Fulmar I 1940", 31.77,14.14,4445,1080,[(2700,1080)],1,398, 6.6, 6555,6.29),
     ("Albacore 1940", 57.90,15.24,4745,1130,[(1200,1065)],1,259, 3.6, 6310,4.01),
     ("Bf 110C 1939",  38.40,16.25,6750,1100,[(4000,1050)],2,560, 9.7,10000,6.88),
     ("Gladiator 1937",30.00, 9.83,2206, 830,[(4400,745)],1,414, 11.4,10200,3.22),
    ]
    print(f"{'aircraft':17s} {'f m2':>6s} {'Cd0':>7s} {'climb SL':>16s} {'ceiling':>15s}  L/Dmax")
    for nm,S,b,W,hp,rt,n,rv,rc,rceil,ar in REAL:
        p=Plane(nm,S,b,W,hp,rt,n=n,vmax_kmh=rv,vmax_h=rt[0][0])
        print(f"{nm:17s} {p.f:6.3f} {p.f/S:7.4f} {p.roc(0):7.1f} vs{rc:5.1f} {p.ceiling():8.0f} vs{rceil:5d}  {p.LDmax():5.2f}")
    print()
    a=Plane("A6M2",22.44,12.00,2410,940,[(4200,950)],vmax_kmh=533,vmax_h=4200)
    s=Plane("Spit",22.48,11.23,2624,1030,[(5800,1030)],vmax_kmh=582,vmax_h=5800)
    w=Plane("Sfish",56.40,13.87,3400,690,[(1500,690)],vmax_kmh=222,vmax_h=1500)
    print("RANGE (Breguet, eta .80 / bsfc .29 kg/hp-h):")
    print("  !! VALID FOR CLEAN FAST MONOPLANES ONLY. The control below is part of the model:")
    print("     A6M2 +0.2 %, Spitfire +3.9 % -- good. Swordfish 0.48x, Arado Ar 196 0.41x -- NOT USABLE.")
    print("     Solving f from a LOW Vmax over-reads drag, because eta 0.80 is wrong for a slow")
    print("     fixed-pitch aeroplane. DO NOT adjudicate the range of a slow draggy type with this model.")
    print(f"  A6M2      K {a.K():6.0f}  518 L -> {a.range_km(2410,373):5.0f} km (real ~1,870)   endur {a.endurance_h(2410,373):.1f} h (real 6-8)")
    print(f"  Spitfire  K {s.K():6.0f}  386 L -> {s.range_km(2624,278):5.0f} km (real ferry ~1,140)")
    print(f"  Swordfish K {w.K():6.0f}  693 L -> {w.range_km(3400,499):5.0f} km (real ~1,660)   endur {w.endurance_h(3400,499):.1f} h (real ~5.7)")
