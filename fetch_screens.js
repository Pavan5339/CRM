const fs = require('fs');
const https = require('https');
const path = require('path');

const screens = [
  { name: 'AdminDashboard', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc5ZDRmNmUyYzQ4OTQ5MmY4ZmRjZDk1M2Q0YWI4NDg3EgsSBxDNqLb5gBoYAZIBIwoKcHJvamVjdF9pZBIVQhM4NzgzNzQ0NTQ5NDY0NzMyNjMx&filename=&opi=89354086' },
  { name: 'PayoutsPayroll', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzdkZDY1YTcxZjc3ZjQxNGE5MDQ0MTNhZTY5ZTFmYjA1EgsSBxDNqLb5gBoYAZIBIwoKcHJvamVjdF9pZBIVQhM4NzgzNzQ0NTQ5NDY0NzMyNjMx&filename=&opi=89354086' },
  { name: 'AddEmployee', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2I4YWViNDZkYzYyYzQyNWY4MzMzMDVjYTc4NzdiMmVlEgsSBxDNqLb5gBoYAZIBIwoKcHJvamVjdF9pZBIVQhM4NzgzNzQ0NTQ5NDY0NzMyNjMx&filename=&opi=89354086' },
  { name: 'EmployeeList', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JiMjhlMWQ2ZDdlMDQ2MjQ4NGM3NzRkN2M3NDgyZWYwEgsSBxDNqLb5gBoYAZIBIwoKcHJvamVjdF9pZBIVQhM4NzgzNzQ0NTQ5NDY0NzMyNjMx&filename=&opi=89354086' },
  { name: 'DetailedEmployeeProfile', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzMyYjdjMGRkZDFkYjQ5MWY4MWRkYTRlNWIxNzVhOWRjEgsSBxDNqLb5gBoYAZIBIwoKcHJvamVjdF9pZBIVQhM4NzgzNzQ0NTQ5NDY0NzMyNjMx&filename=&opi=89354086' },
  { name: 'EmployeeAnalytics', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzgyYzZiMDE0ZjhmMzRjNWJhYzc5NWM5ODVjMGE0MTE4EgsSBxDNqLb5gBoYAZIBIwoKcHJvamVjdF9pZBIVQhM4NzgzNzQ0NTQ5NDY0NzMyNjMx&filename=&opi=89354086' }
];

const tmpDir = path.join(__dirname, 'tmp_stitch_screens');
if (!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir);
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function download() {
  for (const screen of screens) {
    const file = fs.createWriteStream(path.join(tmpDir, `${screen.name}.html`));
    console.log(`Downloading ${screen.name}...`);
    await new Promise((resolve, reject) => {
      https.get(screen.url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close();  
          resolve();
        });
      }).on('error', function(err) {
        fs.unlink(path.join(tmpDir, `${screen.name}.html`));
        reject(err);
      });
    });
    console.log(`Saved ${screen.name}.html`);
    await wait(500); // small delay between requests
  }
}

download().catch(console.error);
