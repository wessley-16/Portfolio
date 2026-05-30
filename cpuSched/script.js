function getInputData() {
    const n = parseInt(document.getElementById("processCount").value);

    const burst = document.getElementById("burstTime").value
        .trim().split(/\s+/).map(Number);

    const arrival = document.getElementById("arrivalTime").value
        .trim().split(/\s+/).map(Number);

    const priority = document.getElementById("priority").value
        .trim().split(/\s+/).map(Number);

    const quantum = parseInt(document.getElementById("timeQuantum").value);

    if (burst.length !== n || arrival.length !== n) {
        alert("Mismatch in number of processes!");
        return null;
    }

    let processes = [];

    for (let i = 0; i < n; i++) {
        processes.push({
            id: "P" + (i + 1),
            burst: burst[i],
            arrival: arrival[i],
            priority: priority[i] || 0
        });
    }

    return { processes, quantum };
}

// First-Come, First-Served (FCFS)
function runFCFS() {
    const data = getInputData();
    if (!data) return;

    let processes = data.processes.sort((a, b) => a.arrival - b.arrival);

    let currentTime = 0;
    let gantt = [];
    let totalTAT = 0;
    let totalWT = 0;
    let results = [];

    processes.forEach(p => {
        if (currentTime < p.arrival) {
            currentTime = p.arrival;
        }

        let start = currentTime;
        let finish = start + p.burst;

        let tat = finish - p.arrival;
        let wt = tat - p.burst;

        totalTAT += tat;
        totalWT += wt;

        gantt.push({ id: p.id, start, finish });

        results.push({
            id: p.id,
            arrival: p.arrival,
            burst: p.burst,
            priority: p.priority,
            tat,
            wt,
            finish
        });

        currentTime = finish;
    });

    displayTable(results);
    displayComputationDetails1(results);
    displayComputationDetails2(results);
    displayGantt(gantt);
    displayAverages(totalTAT, totalWT, processes.length);
}

// Shortest Job First (SJF)
function runSJF() {
    const data = getInputData();
    if (!data) return;

    let processes = data.processes;
    let remaining = [...processes];

    let currentTime = 0;
    let completed = 0;
    let n = processes.length;

    let gantt = [];
    let totalTAT = 0;
    let totalWT = 0;
    let results = [];

    while (completed < n) {

        // Get processes that have arrived
        let readyQueue = remaining.filter(p => p.arrival <= currentTime);

        // If none available, jump time
        if (readyQueue.length === 0) {
            currentTime = Math.min(...remaining.map(p => p.arrival));
            continue;
        }

        // Sort by shortest burst, then arrival
        readyQueue.sort((a, b) => {
            if (a.burst === b.burst) return a.arrival - b.arrival;
            return a.burst - b.burst;
        });

        let current = readyQueue[0];

        let start = currentTime;
        let finish = start + current.burst;

        let turnaround = finish - current.arrival;
        let waiting = turnaround - current.burst;

        totalTAT += turnaround;
        totalWT += waiting;

        // Gantt chart entry
        gantt.push({
            id: current.id,
            start: start,
            finish: finish
        });

        // Store per-process results
        results.push({
            id: current.id,
            arrival: current.arrival,
            burst: current.burst,
            priority: current.priority,
            tat: turnaround,
            wt: waiting,
            finish: finish
        });

        // Move time forward
        currentTime = finish;

        // Remove finished process
        remaining = remaining.filter(p => p !== current);

        completed++;
    }

    displayTable(results);
    displayComputationDetails1(results);
    displayComputationDetails2(results);
    displayGantt(gantt);
    displayAverages(totalTAT, totalWT, n);
}

// Shortest Remaining Time First (SRTF)
function runSRTF() {
    const data = getInputData();
    if (!data) return;

    let processes = data.processes.map(p => ({
        ...p,
        remaining: p.burst,
        completed: false
    }));

    let n = processes.length;
    let completed = 0;
    let currentTime = 0;

    let gantt = [];
    let lastProcess = null;

    let totalTAT = 0;
    let totalWT = 0;
    let results = [];

    while (completed < n) {

        // Get ready processes
        let readyQueue = processes.filter(p =>
            p.arrival <= currentTime && !p.completed
        );

        if (readyQueue.length === 0) {
            currentTime++;
            continue;
        }

        // Sort by remaining time, then arrival
        readyQueue.sort((a, b) => {
            if (a.remaining === b.remaining) {
                // NEW ARRIVAL PRIORITY
                if (a.arrival !== b.arrival) {
                    return b.arrival - a.arrival;
                }
                return a.arrival - b.arrival;
            }
            return a.remaining - b.remaining;
        });

        let current = readyQueue[0];

        // Gantt handling (merge same process blocks)
        if (lastProcess !== current.id) {
            gantt.push({
                id: current.id,
                start: currentTime,
                finish: currentTime + 1
            });
        } else {
            gantt[gantt.length - 1].finish++;
        }

        lastProcess = current.id;

        // Execute 1 unit
        current.remaining--;
        currentTime++;

        // If finished
        if (current.remaining === 0) {
            current.completed = true;
            completed++;

            let finishTime = currentTime;

            let turnaround = finishTime - current.arrival;
            let waiting = turnaround - current.burst;

            totalTAT += turnaround;
            totalWT += waiting;

            results.push({
                id: current.id,
                arrival: current.arrival,
                burst: current.burst,
                priority: current.priority,
                tat: turnaround,
                wt: waiting,
                finish: finishTime
            });
        }
    }

    displayTable(results);
    displayComputationDetails1(results);
    displayComputationDetails2(results);
    displayGantt(gantt);
    displayAverages(totalTAT, totalWT, n);
}

// Round Robin (RR)
function runRR() {
    const data = getInputData();
    if (!data) return;

    let quantum = data.quantum;
    if (!quantum || quantum <= 0) {
        alert("Please enter a valid time quantum!");
        return;
    }

    let processes = data.processes.map(p => ({
        ...p,
        remaining: p.burst,
        completed: false
    }));

    let n = processes.length;
    let completed = 0;
    let currentTime = 0;

    let queue = [];
    let gantt = [];
    let results = [];

    let totalTAT = 0;
    let totalWT = 0;

    // Sort processes by arrival initially
    processes.sort((a, b) => a.arrival - b.arrival);

    let index = 0; // tracks arrivals

    while (completed < n) {

        // Add newly arrived processes to queue
        while (index < n && processes[index].arrival <= currentTime) {
            queue.push(processes[index]);
            index++;
        }

        // If queue is empty → jump time
        if (queue.length === 0) {
            currentTime = processes[index].arrival;
            continue;
        }

        let current = queue.shift();

        let start = currentTime;
        let execTime = Math.min(quantum, current.remaining);

        // Execute
        current.remaining -= execTime;
        currentTime += execTime;

        // Gantt chart
        gantt.push({
            id: current.id,
            start: start,
            finish: currentTime
        });

        // Add newly arrived processes during execution
        while (index < n && processes[index].arrival <= currentTime) {
            queue.push(processes[index]);
            index++;
        }

        // If process not finished → push back
        if (current.remaining > 0) {
            queue.push(current);
        } else {
            // Finished
            completed++;

            let finishTime = currentTime;
            let turnaround = finishTime - current.arrival;
            let waiting = turnaround - current.burst;

            totalTAT += turnaround;
            totalWT += waiting;

            results.push({
                id: current.id,
                arrival: current.arrival,
                burst: current.burst,
                priority: current.priority,
                tat: turnaround,
                wt: waiting,
                finish: finishTime
            });
        }
    }

    displayTable(results);
    displayComputationDetails1(results);
    displayComputationDetails2(results);
    displayGantt(gantt);
    displayAverages(totalTAT, totalWT, n);
}

// Priority
function runPriority() {
    const data = getInputData();
    if (!data) return;

    let processes = data.processes.map(p => ({
        ...p,
        remaining: p.burst,
        completed: false
    }));

    let n = processes.length;
    let completed = 0;
    let currentTime = 0;

    let gantt = [];
    let lastProcess = null;

    let results = [];
    let totalTAT = 0;
    let totalWT = 0;

    while (completed < n) {

        let readyQueue = processes.filter(p =>
            p.arrival <= currentTime && !p.completed
        );

        if (readyQueue.length === 0) {
            currentTime++;
            continue;
        }

        // Sort by priority, then arrival
        readyQueue.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.arrival - b.arrival;
            }
            return a.priority - b.priority;
        });

        let current = readyQueue[0];

        // Gantt merge logic
        if (lastProcess !== current.id) {
            gantt.push({
                id: current.id,
                start: currentTime,
                finish: currentTime + 1
            });
        } else {
            gantt[gantt.length - 1].finish++;
        }

        lastProcess = current.id;

        // Execute 1 unit
        current.remaining--;
        currentTime++;

        // If finished
        if (current.remaining === 0) {
            current.completed = true;
            completed++;

            let finishTime = currentTime;
            let tat = finishTime - current.arrival;
            let wt = tat - current.burst;

            totalTAT += tat;
            totalWT += wt;

            results.push({
                id: current.id,
                arrival: current.arrival,
                burst: current.burst,
                priority: current.priority,
                tat,
                wt,
                finish: finishTime
            });
        }
    }

    displayTable(results);
    displayComputationDetails1(results);
    displayComputationDetails2(results);
    displayGantt(gantt);
    displayAverages(totalTAT, totalWT, n);
}

// Gantt Chart
function displayGantt(gantt) {
    const chart = document.getElementById("ganttChart");
    chart.innerHTML = "";

    gantt.forEach(block => {
        const div = document.createElement("div");
        div.style.display = "inline-block";
        div.style.border = "2px solid black";
        div.style.padding = "10px";

        div.innerHTML = `${block.id}<br>${block.start} - ${block.finish}`;
        chart.appendChild(div);
    });
}

// Results Table
function displayTable(results) {
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    results.forEach(p => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.id}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            <td>${p.priority ?? "-"}</td>
        `;

        tbody.appendChild(row);
    });
}

function displayComputationDetails1(results) {
    const container = document.getElementById("computationResults1");
    container.innerHTML = "";

    results.forEach(p => {
        const div = document.createElement("div");
        div.style.marginBottom = "10px";

        div.innerHTML = `
            <strong>${p.id}</strong> =
            ${p.finish}
            - ${p.arrival}
            = ${p.tat}
        `;

        container.appendChild(div);
    });
}

function displayComputationDetails2(results) {
    const container = document.getElementById("computationResults2");
    container.innerHTML = "";

    results.forEach(p => {
        const div = document.createElement("div");
        div.style.marginBottom = "10px";

        div.innerHTML = `
            <strong>${p.id}</strong> =
            ${p.tat}
            - ${p.burst}
            = ${p.wt}
        `;

        container.appendChild(div);
    });
}

function displayAverages(tat, wt, n) {
    document.getElementById("avgTurnaroundTime").innerText = (tat / n).toFixed(2);
    document.getElementById("avgWaitingTime").innerText = (wt / n).toFixed(2);
}