"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
const links=[["/construction","Construction"],["/recruitment","Recruitment"],["/projects","Projects"],["/jobs","Jobs"],["/gallery", "Gallery"],["/about","About"]];
export default function Header(){const p=usePathname();const[open,setOpen]=useState(false);if(p.startsWith('/admin'))return null;return <header className="siteHeader"><div className="container headerInner"><Link href="/" className="brand">WORKIFY</Link><button className="menuBtn" onClick={()=>setOpen(!open)} aria-label="Toggle menu"><span/><span/></button><nav className={open?"nav open":"nav"}>{links.map(([h,l])=><Link key={h} href={h} className={p===h?"active":""} onClick={()=>setOpen(false)}>{l}</Link>)}<Link href="/contact" className="navCta" onClick={()=>setOpen(false)}>Start a request</Link></nav></div></header>}


