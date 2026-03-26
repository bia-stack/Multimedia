var persoane = [];
var modIntunecat = false;

window.onload = function() {
    incarcaTema();
    
    document.getElementById('forma1').onsubmit = function(e) {
        e.preventDefault();
        
        var nume = document.getElementById('last-name').value.trim();
        var prenume = document.getElementById('first-name').value.trim();
        var telefon = document.getElementById('phone-number').value.trim();
        
        if (nume && prenume && telefon) {
            adaugaPersoana(nume, prenume, telefon);
        } else {
            alert('Completează toate câmpurile!');
        }
    };
    
    document.getElementById('schimbaTema').onclick = function() {
        schimbaTema();
    };
};

function adaugaPersoana(nume, prenume, telefon) {
    var animatie = document.getElementById('animation');
    animatie.style.display = 'block';
    
    setTimeout(function() {
        var persoana = {
            id: new Date().getTime(),
            nume: nume,
            prenume: prenume,
            telefon: telefon
        };
        
        persoane.push(persoana);
        actualizeazaTabel();
        
        animatie.style.display = 'none';
        golesteFormular();
    }, 1000);
}

function actualizeazaTabel() {
    var corpTabel = document.getElementById('table-body');
    corpTabel.innerHTML = '';
    
    for (var i = 0; i < persoane.length; i++) {
        var rand = document.createElement('tr');
        rand.innerHTML = '<td>' + persoane[i].nume + '</td>' +
                        '<td>' + persoane[i].prenume + '</td>' +
                        '<td>' + persoane[i].telefon + '</td>' +
                        '<td><button class="sterge" onclick="stergePersoana(' + persoane[i].id + ')">Delete</button></td>';
        corpTabel.appendChild(rand);
    }
    
    document.getElementById('total').textContent = persoane.length;
}

function stergePersoana(id) {
    if (confirm('Sigur vrei să ștergi această persoană?')) {
        for (var i = 0; i < persoane.length; i++) {
            if (persoane[i].id === id) {
                persoane.splice(i, 1);
                break;
            }
        }
        actualizeazaTabel();
    }
}

function golesteFormular() {
    document.getElementById('forma1').reset();
}

function schimbaTema() {
    modIntunecat = !modIntunecat;
    
    if (modIntunecat) {
        document.body.classList.add('tema-intunecata');
        document.getElementById('schimbaTema').textContent = 'Mod Luminos';
    } else {
        document.body.classList.remove('tema-intunecata');
        document.getElementById('schimbaTema').textContent = 'Mod Întunecat';
    }
    
    localStorage.setItem('tema', modIntunecat ? 'intunecat' : 'luminos');
}

function incarcaTema() {
    var temaSalvata = localStorage.getItem('tema');
    
    if (temaSalvata === 'intunecat') {
        modIntunecat = true;
        document.body.classList.add('tema-intunecata');
        document.getElementById('schimbaTema').textContent = 'Mod Luminos';
    }
}