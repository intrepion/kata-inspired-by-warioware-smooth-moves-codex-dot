'use strict';
const {chromium}=require('playwright');const {mkdir,readFile,writeFile}=require('node:fs/promises');const {createHash}=require('node:crypto');const path=require('node:path');
(async()=>{const output=process.env.CAPTURE_OUTPUT||'/tmp/wiggle-captures',site=process.env.CAPTURE_SITE||'capture-site';await mkdir(output,{recursive:true});const inputs={};for(const f of ['index.html','style.css','game.js'])inputs[f]=createHash('sha256').update(await readFile(path.join(site,f))).digest('hex');const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4201/',{waitUntil:'domcontentloaded'});await page.locator('#start').click();await page.waitForTimeout(2600);
 await page.locator('section.cabinet').screenshot({path:path.join(output,'wiggle-01.png'),animations:'disabled'});
 await page.keyboard.press('Space');await page.waitForTimeout(7000);
 await page.locator('section.cabinet').screenshot({path:path.join(output,'wiggle-02.png'),animations:'disabled'});
 await writeFile(path.join(output,'capture.json'),JSON.stringify({schemaVersion:1,workflowCommit:process.env.GITHUB_SHA||null,sourceCommit:process.env.GAME_SOURCE_COMMIT||null,runId:process.env.GITHUB_RUN_ID||null,url:'http://127.0.0.1:4201/',inputs,browser:browser.version(),viewport:{width:1280,height:1000},screenshots:['wiggle-01.png','wiggle-02.png']},null,2)+'\n');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
