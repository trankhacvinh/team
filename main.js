 class TeamSplitterApp {
    constructor() {
        this.members = [];
        this.teams = [];
        this.teamColors = [
            { name: 'A', color: 'red', bg: 'bg-red-500', emoji: '❤️' },
            { name: 'B', color: 'yellow', bg: 'bg-yellow-500', emoji: '💛' },
            { name: 'C', color: 'green', bg: 'bg-green-500', emoji: '💚' },
            { name: 'D', color: 'blue', bg: 'bg-blue-500', emoji: '💙' },
            { name: 'E', color: 'purple', bg: 'bg-purple-500', emoji: '💜' },
            { name: 'F', color: 'indigo', bg: 'bg-indigo-500', emoji: '💙' },
            { name: 'G', color: 'pink', bg: 'bg-pink-500', emoji: '💗' },
            { name: 'H', color: 'orange', bg: 'bg-orange-500', emoji: '🧡' },
            { name: 'I', color: 'teal', bg: 'bg-teal-500', emoji: '💚' },
            { name: 'J', color: 'cyan', bg: 'bg-cyan-500', emoji: '💙' },
            { name: 'K', color: 'lime', bg: 'bg-lime-500', emoji: '💚' },
            { name: 'L', color: 'amber', bg: 'bg-amber-500', emoji: '💛' },
            { name: 'M', color: 'emerald', bg: 'bg-emerald-500', emoji: '💚' },
            { name: 'N', color: 'violet', bg: 'bg-violet-500', emoji: '💜' },
            { name: 'O', color: 'fuchsia', bg: 'bg-fuchsia-500', emoji: '💗' },
            { name: 'P', color: 'rose', bg: 'bg-rose-500', emoji: '🌹' },
            { name: 'Q', color: 'sky', bg: 'bg-sky-500', emoji: '💙' },
            { name: 'R', color: 'slate', bg: 'bg-slate-500', emoji: '🖤' },
            { name: 'S', color: 'zinc', bg: 'bg-zinc-500', emoji: '🤍' },
            { name: 'T', color: 'stone', bg: 'bg-stone-500', emoji: '🤎' }
        ];
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.id.replace('tab-', '')));
        });

        // Excel import
        document.getElementById('excel-file').addEventListener('change', (e) => this.handleExcelImport(e));

        // Quick add buttons
        document.getElementById('add-males-btn').addEventListener('click', () => this.addQuickList('male'));
        document.getElementById('add-females-btn').addEventListener('click', () => this.addQuickList('female'));

        // Team operations
        document.getElementById('split-teams-btn').addEventListener('click', () => this.splitTeams());
        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAll());

        // Print and export
        document.getElementById('print-btn').addEventListener('click', () => window.print());
        document.getElementById('export-btn').addEventListener('click', () => this.exportToExcel());
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active', 'bg-blue-500', 'text-white'));
        document.getElementById(`tab-${tab}`).classList.add('active', 'bg-blue-500', 'text-white');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        document.getElementById(`content-${tab}`).classList.remove('hidden');
    }

    handleExcelImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                let importedCount = 0;
                jsonData.forEach((row, index) => {
                    if (index === 0) return; // Skip header
                    if (!row[0] || !row[1]) return; // Skip empty rows

                    const name = row[0].toString().trim();
                    const gender = row[1].toString().trim().toLowerCase();
                    const phone = row[2] ? row[2].toString().trim() : '';

                    if (name && (gender === 'nam' || gender === 'nữ' || gender === 'male' || gender === 'female')) {
                        const normalizedGender = (gender === 'nam' || gender === 'male') ? 'male' : 'female';
                        this.addMember(name, normalizedGender, phone);
                        importedCount++;
                    }
                });

                this.showToast(`Đã import thành công ${importedCount} thành viên!`);
                this.updateUI();
            } catch (error) {
                this.showToast('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    addQuickList(gender) {
        const textareaId = gender === 'male' ? 'male-list' : 'female-list';
        const textarea = document.getElementById(textareaId);
        const lines = textarea.value.split('\n').filter(line => line.trim());

        let addedCount = 0;
        lines.forEach(line => {
            const parts = line.trim().split(',');
            const name = parts[0].trim();
            const phone = parts[1] ? parts[1].trim() : '';

            if (name) {
                this.addMember(name, gender, phone);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            textarea.value = '';
            this.showToast(`Đã thêm ${addedCount} thành viên ${gender === 'male' ? 'nam' : 'nữ'}!`);
            this.updateUI();
        }
    }

    addMember(name, gender, phone = '') {
        // Check for duplicates
        const exists = this.members.some(member => 
            member.name.toLowerCase() === name.toLowerCase()
        );

        if (!exists) {
            this.members.push({
                id: Date.now() + Math.random(),
                name: name,
                gender: gender,
                phone: phone
            });
            this.saveData();
        }
    }

    removeMember(id) {
        this.members = this.members.filter(member => member.id !== id);
        this.saveData();
        this.updateUI();
    }

    splitTeams() {
        if (this.members.length === 0) {
            this.showToast('Vui lòng thêm thành viên trước khi chia nhóm!', 'error');
            return;
        }

        const teamCount = parseInt(document.getElementById('team-count').value);
        if (teamCount < 2 || teamCount > 20) {
            this.showToast('Số lượng nhóm phải từ 2 đến 20!', 'error');
            return;
        }

        // Initialize teams
        this.teams = [];
        for (let i = 0; i < teamCount; i++) {
            this.teams.push({
                id: i,
                name: this.teamColors[i].name,
                color: this.teamColors[i],
                members: [],
                maleCount: 0,
                femaleCount: 0
            });
        }

        // Improved distribution algorithm
        this.distributeTeamsBalanced(teamCount);

        this.showToast(`Đã chia thành công thành ${teamCount} nhóm!`);
        this.switchTab('teams');
        this.updateTeamsDisplay();
    }

    distributeTeamsBalanced(teamCount) {
        // Separate by gender and shuffle
        const males = this.members.filter(m => m.gender === 'male');
        const females = this.members.filter(m => m.gender === 'female');
        
        this.shuffleArray(males);
        this.shuffleArray(females);

        const totalMembers = this.members.length;
        const baseSize = Math.floor(totalMembers / teamCount);
        const remainder = totalMembers % teamCount;
        
        // Calculate exact team sizes
        const teamSizes = [];
        for (let i = 0; i < teamCount; i++) {
            teamSizes.push(baseSize + (i < remainder ? 1 : 0));
        }

        // Strategy 1: Try to balance gender within each team
        if (this.tryBalancedGenderDistribution(males, females, teamSizes)) {
            return;
        }

        // Strategy 2: Fallback - distribute all members evenly regardless of gender
        this.fallbackDistribution(teamSizes);
    }

    tryBalancedGenderDistribution(males, females, teamSizes) {
        try {
            const totalMales = males.length;
            const totalFemales = females.length;
            const teamCount = teamSizes.length;

            // Calculate ideal male/female distribution per team
            const idealMalePerTeam = totalMales / teamCount;
            const idealFemalePerTeam = totalFemales / teamCount;

            let maleIndex = 0;
            let femaleIndex = 0;

            for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
                const teamSize = teamSizes[teamIndex];
                const team = this.teams[teamIndex];

                // Calculate how many males/females this team should get
                let targetMales = Math.round(idealMalePerTeam);
                let targetFemales = Math.round(idealFemalePerTeam);

                // Adjust if we don't have enough members left
                const malesLeft = totalMales - maleIndex;
                const femalesLeft = totalFemales - femaleIndex;
                const teamsLeft = teamCount - teamIndex;

                // Distribute remaining members among remaining teams
                targetMales = Math.min(targetMales, Math.ceil(malesLeft / teamsLeft));
                targetFemales = Math.min(targetFemales, Math.ceil(femalesLeft / teamsLeft));

                // Adjust if team size constraint
                const totalGenderMembers = targetMales + targetFemales;
                if (totalGenderMembers > teamSize) {
                    // Reduce proportionally
                    const ratio = teamSize / totalGenderMembers;
                    targetMales = Math.floor(targetMales * ratio);
                    targetFemales = teamSize - targetMales;
                } else if (totalGenderMembers < teamSize) {
                    // Add more members, prefer balanced approach
                    const needed = teamSize - totalGenderMembers;
                    const maleCanAdd = Math.min(needed, malesLeft - targetMales);
                    const femaleCanAdd = Math.min(needed - maleCanAdd, femalesLeft - targetFemales);
                    targetMales += maleCanAdd;
                    targetFemales += femaleCanAdd;
                }

                // Add males to team
                for (let i = 0; i < targetMales && maleIndex < totalMales; i++) {
                    team.members.push(males[maleIndex]);
                    team.maleCount++;
                    maleIndex++;
                }

                // Add females to team
                for (let i = 0; i < targetFemales && femaleIndex < totalFemales; i++) {
                    team.members.push(females[femaleIndex]);
                    team.femaleCount++;
                    femaleIndex++;
                }

                // If still need more members (edge case), add from remaining
                while (team.members.length < teamSize) {
                    if (maleIndex < totalMales) {
                        team.members.push(males[maleIndex]);
                        team.maleCount++;
                        maleIndex++;
                    } else if (femaleIndex < totalFemales) {
                        team.members.push(females[femaleIndex]);
                        team.femaleCount++;
                        femaleIndex++;
                    } else {
                        break;
                    }
                }
            }

            // Check if all members are distributed
            const totalDistributed = this.teams.reduce((sum, team) => sum + team.members.length, 0);
            return totalDistributed === this.members.length;
        } catch (error) {
            return false;
        }
    }

    fallbackDistribution(teamSizes) {
        // Reset teams
        this.teams.forEach(team => {
            team.members = [];
            team.maleCount = 0;
            team.femaleCount = 0;
        });

        // Shuffle all members regardless of gender
        const allMembers = [...this.members];
        this.shuffleArray(allMembers);

        let memberIndex = 0;
        for (let teamIndex = 0; teamIndex < teamSizes.length; teamIndex++) {
            const teamSize = teamSizes[teamIndex];
            const team = this.teams[teamIndex];

            for (let i = 0; i < teamSize && memberIndex < allMembers.length; i++) {
                const member = allMembers[memberIndex];
                team.members.push(member);
                
                if (member.gender === 'male') {
                    team.maleCount++;
                } else {
                    team.femaleCount++;
                }
                memberIndex++;
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    clearAll() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu?')) {
            this.members = [];
            this.teams = [];
            this.saveData();
            this.updateUI();
            this.showToast('Đã xóa tất cả dữ liệu!');
        }
    }

    updateUI() {
        this.updateMembersList();
        this.updateCounts();
    }

    updateCounts() {
        const maleCount = this.members.filter(m => m.gender === 'male').length;
        const femaleCount = this.members.filter(m => m.gender === 'female').length;
        const totalCount = this.members.length;

        document.getElementById('member-count').textContent = totalCount;
        document.getElementById('male-count').textContent = maleCount;
        document.getElementById('female-count').textContent = femaleCount;
    }

    updateMembersList() {
        const container = document.getElementById('members-list');
        if (!container) return;

        if (this.members.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Chưa có thành viên nào</div>';
            return;
        }

        container.innerHTML = this.members.map(member => `
            <div class="bg-gray-50 rounded-lg p-4 border ${member.gender === 'male' ? 'border-blue-200' : 'border-pink-200'}">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="font-semibold text-gray-800">${member.name}</div>
                        <div class="text-sm ${member.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}">
                            ${member.gender === 'male' ? '👨 Nam' : '👩 Nữ'}
                        </div>
                        ${member.phone ? `<div class="text-sm text-gray-600">📞 ${member.phone}</div>` : ''}
                    </div>
                    <button onclick="app.removeMember(${member.id})" 
                            class="text-red-500 hover:text-red-700 ml-2">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateTeamsDisplay() {
        const container = document.getElementById('teams-result');
        if (!container || this.teams.length === 0) {
            if (container) {
                container.innerHTML = '<div class="text-center py-8 text-gray-500">Chưa có kết quả chia nhóm</div>';
            }
            return;
        }

        // Summary statistics
        const totalMembers = this.members.length;
        const totalMales = this.members.filter(m => m.gender === 'male').length;
        const totalFemales = this.members.filter(m => m.gender === 'female').length;

        const summaryHtml = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 class="text-2xl font-bold text-center mb-4">📊 Tổng Quan Chia Nhóm</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div class="bg-gray-100 rounded-lg p-3">
                        <div class="text-2xl font-bold text-gray-800">${this.teams.length}</div>
                        <div class="text-sm text-gray-600">Số nhóm</div>
                    </div>
                    <div class="bg-blue-100 rounded-lg p-3">
                        <div class="text-2xl font-bold text-blue-800">${totalMembers}</div>
                        <div class="text-sm text-blue-600">Tổng thành viên</div>
                    </div>
                    <div class="bg-blue-100 rounded-lg p-3">
                        <div class="text-2xl font-bold text-blue-800">${totalMales}</div>
                        <div class="text-sm text-blue-600">👨 Nam</div>
                    </div>
                    <div class="bg-pink-100 rounded-lg p-3">
                        <div class="text-2xl font-bold text-pink-800">${totalFemales}</div>
                        <div class="text-sm text-pink-600">👩 Nữ</div>
                    </div>
                </div>
            </div>
        `;

        const teamsHtml = this.teams.map(team => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div class="${team.color.bg} text-white p-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-2xl font-bold">
                            ${team.color.emoji} Nhóm ${team.name}
                        </h3>
                        <div class="text-lg">
                            ${team.members.length} thành viên
                        </div>
                    </div>
                    <div class="mt-2 text-sm opacity-90">
                        👨 ${team.maleCount} nam • 👩 ${team.femaleCount} nữ
                    </div>
                </div>
                <div class="p-4">
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${team.members.map(member => `
                            <div class="bg-gray-50 rounded-lg p-3 border-l-4 ${team.color.bg.replace('bg-', 'border-')}">
                                <div class="font-semibold text-gray-800">${member.name}</div>
                                <div class="text-sm ${member.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}">
                                    ${member.gender === 'male' ? '👨 Nam' : '👩 Nữ'}
                                </div>
                                ${member.phone ? `<div class="text-xs text-gray-600">📞 ${member.phone}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = summaryHtml + teamsHtml;
    }

    exportToExcel() {
        if (this.teams.length === 0) {
            this.showToast('Chưa có kết quả chia nhóm để xuất!', 'error');
            return;
        }

        const wb = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
            ['Tổng quan chia nhóm'],
            ['Số nhóm:', this.teams.length],
            ['Tổng thành viên:', this.members.length],
            ['Nam:', this.members.filter(m => m.gender === 'male').length],
            ['Nữ:', this.members.filter(m => m.gender === 'female').length],
            [],
            ['Chi tiết từng nhóm:']
        ];

        this.teams.forEach(team => {
            summaryData.push([`Nhóm ${team.name}`, `${team.members.length} thành viên`, `Nam: ${team.maleCount}`, `Nữ: ${team.femaleCount}`]);
        });

        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Tổng quan');

        // Detail sheet for each team
        this.teams.forEach(team => {
            const teamData = [
                [`Nhóm ${team.name}`, '', ''],
                ['STT', 'Họ tên', 'Giới tính', 'Số điện thoại'],
                ...team.members.map((member, index) => [
                    index + 1,
                    member.name,
                    member.gender === 'male' ? 'Nam' : 'Nữ',
                    member.phone || ''
                ])
            ];

            const teamWS = XLSX.utils.aoa_to_sheet(teamData);
            XLSX.utils.book_append_sheet(wb, teamWS, `Nhóm ${team.name}`);
        });

        // Save file
        const fileName = `KetQuaChiaNhom_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        this.showToast('Đã xuất file Excel thành công!');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        
        toast.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
        }, 3000);
    }

    saveData() {
        localStorage.setItem('teamSplitterMembers', JSON.stringify(this.members));
        localStorage.setItem('teamSplitterTeams', JSON.stringify(this.teams));
    }

    loadData() {
        const savedMembers = localStorage.getItem('teamSplitterMembers');
        const savedTeams = localStorage.getItem('teamSplitterTeams');
        
        if (savedMembers) {
            this.members = JSON.parse(savedMembers);
        }
        
        if (savedTeams) {
            this.teams = JSON.parse(savedTeams);
            if (this.teams.length > 0) {
                this.updateTeamsDisplay();
            }
        }
    }
}

// Initialize app when page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TeamSplitterApp();
});
