# Technologie Chmurowe – Zadanie 2

**Sandra Zaremba** 
**GitHub:** `ghcr.io/saska005/tch-zadanie2`  
**Docker Hub:** `docker.io/sandrazarrr/tch-zadanie2-cache`

---

## 1. Opis i cel zadania
Zadanie polegało na implementacji automatycznego potoku CI/CD w usłudze **GitHub Actions**. Konfiguracja odpowiada za budowanie obrazu kontenera na podstawie kodu źródłowego aplikacji pogodowej oraz pliku `Dockerfile` z Zadania 1, a następnie za jego przesłanie do rejestru GitHub Packages (`ghcr.io`).

Wdrożony potok spełnia następujące wymagania techniczne:
* **Wsparcie dla wielu architektur (Multi-arch):** Obraz jest kompilowany jednocześnie dla platform `linux/amd64` oraz `linux/arm64`.
* **Zarządzanie pamięcią podręczną (Cache):** Proces budowania wykorzystuje zewnętrzny backend cache (`registry` w trybie `max`), przechowywany w dedykowanym, publicznym repozytorium na Docker Hubie.
* **Testy bezpieczeństwa (CVE):** Przed publikacją obrazu w rejestrze końcowym wykonywana jest automatyczna weryfikacja podatności przy użyciu skanera **Trivy**.

---

## 2. Strategia tagowania

### Obrazy aplikacji w GitHub Container Registry (`ghcr.io`)
Każde uruchomienie potoku generuje dwa niezależne tagi dla jednego obrazu:
* **`:latest`** – wskazuje na najnowszą wersję kodu z gałęzi `main`.
* **`:sha-{{ krótki_hash_commita }}`** – unikalny identyfikator odpowiadający konkretnej rewizji w repozytorium Git.

*Uzasadnienie:** Wykorzystywanie wyłącznie tagu `latest` w środowiskach produkcyjnych jest uznawane za antywzorzec (*anti-pattern*). Uniemożliwia  śledzenie wersji i blokuje możliwość wykonania  wycofania zmian (*rollback*) w przypadku awarii. Zastosowanie unikalnych tagów bazujących na hashu SHA commita zapewnia niezmienność (*immutability*) obrazów, powtarzalność wdrożeń i jednoznaczną identyfikację kodu źródłowego.

### Dane cache w Docker Hub (`docker.io`)
Warstwy pamięci podręcznej są przesyłane i pobierane przy użyciu dedykowanego tagu:
* **`:cache`**

*Uzasadnienie:** Odseparowanie warstw cache od tagów wersji aplikacji pozwala utrzymać strukturę rejestru docelowego. Zastosowanie parametru `mode=max` powoduje, że Docker zapisuje cache dla wszystkich etapów budowania (zarówno dla etapu wieloetapowego instalowania zależności `build`, jak i dla końcowej warstwy produkcyjnej). Przy kolejnych uruchomieniach pipeline'u system nie musi ponownie pobierać ani kompilować powtarzających się warstw systemowych, co skraca czas działania potoku.

---

## 3. Przebieg działania potoku (Workflow)

Potok został opisany w pliku `.github/workflows/deploy.yml` i składa się z następujących etapów:

1. **Inicjalizacja środowiska:** Pobranie kodu źródłowego i konfiguracja buildera opartego na sterowniku `docker-container` za pomocą akcji `docker/setup-buildx-action`. Ze względu na architekturę maszyn uruchomieniowych (`amd64`), potok wykorzystuje emulację sprzętową QEMU (`docker/setup-qemu-action`) do kompilacji kodu na architekturę `arm64`.
2. **Uwierzytelnianie:** Logowanie do GitHub Container Registry przy użyciu tokenu `GITHUB_TOKEN` oraz do portalu Docker Hub z wykorzystaniem zdefiniowanych sekretów i zmiennych repozytorium (`vars.DOCKERHUB_USERNAME`, `secrets.DOCKERHUB_TOKEN`).
3. **Generowanie metadanych:** Narzędzie `docker/metadata-action` analizuje kontekst commitu i przygotowuje tagi OCI.
4. **Budowanie testowe i analiza CVE:** Ponieważ skanery podatności nie analizują manifestów wieloarchitekturalnych przed ich wypchnięciem do zdalnego rejestru, potok najpierw buduje obraz lokalnie (`load: true`) dla jednej platformy, po czym uruchamia na nim skaner **Trivy**.
5. **Kompilacja Multi-Arch i Push:** Po zakończeniu skanowania i wygenerowaniu raportu CVE, uruchamiane jest właściwe budowanie końcowe. Obraz jest kompilowany dla architektur `linux/amd64` oraz `linux/arm64`, a następnie wysyłany do rejestru GHCR wraz z eksportem


### Akceptacja ryzyka:
W celu umożliwienia dokończenia procesu CI/CD oraz publikacji obrazu laboratoryjnego, parametr `exit-code` skanera został zmieniony z `1` na `0`. Wykryte podatności zostały świadomie zignorowane i dopuszczone do środowiska testowego.

### Żródła m.in.:
- https://github.com/marketplace/actions/docker-metadata-action
- https://github.com/aquasecurity/trivy-action
