$ErrorActionPreference = 'Stop'

$api = 'https://ssd.jpl.nasa.gov/api/horizons.api'
$outDir = Join-Path $PSScriptRoot '..\data\mission-trajectories'
$outFile = Join-Path $outDir 'jpl-mission-trajectories.json'
$outJsFile = Join-Path $outDir 'jpl-mission-trajectories.js'

$missions = @(
  @{ id = '-31'; name = 'Voyager 1'; launch = '1977-09-05'; start = '1977-09-06'; stop = '2030-01-01'; colour = '#2F6BD8' },
  @{ id = '-32'; name = 'Voyager 2'; launch = '1977-08-20'; start = '1977-08-21'; stop = '2030-01-01'; colour = '#B86A35' },
  @{ id = '-98'; name = 'New Horizons'; launch = '2006-01-19'; start = '2006-01-21'; stop = '2030-01-01'; colour = '#3F8A62' },
  @{ id = '-61'; name = 'Juno'; launch = '2011-08-05'; start = '2011-08-06'; stop = '2028-09-30'; colour = '#7957B8' },
  @{ id = '-96'; name = 'Parker Solar Probe'; launch = '2018-08-12'; start = '2018-08-13'; stop = '2030-01-01'; colour = '#C45C37' },
  @{ id = '-82'; name = 'Cassini'; launch = '1997-10-15'; start = '1997-10-16'; stop = '2017-09-15'; colour = '#4B8B86' },
  @{ id = '-203'; name = 'Dawn'; launch = '2007-09-27'; start = '2007-09-28'; stop = '2018-11-01'; colour = '#A8843D' }
)
$planets = @(
  @{ id = '199'; name = 'Mercury'; colour = '#8D8982' }, @{ id = '299'; name = 'Venus'; colour = '#D7A451' },
  @{ id = '499'; name = 'Mars'; colour = '#C76D4E' }, @{ id = '599'; name = 'Jupiter'; colour = '#C98E62' },
  @{ id = '699'; name = 'Saturn'; colour = '#D8BF81' }, @{ id = '799'; name = 'Uranus'; colour = '#72B7BD' }, @{ id = '899'; name = 'Neptune'; colour = '#4F7FBF' }
)

function Get-VectorRows($target, $start, $stop, $step) {
  $parameters = [ordered]@{
    format = 'text'; COMMAND = "'$target'"; OBJ_DATA = "'NO'"; MAKE_EPHEM = "'YES'"
    EPHEM_TYPE = "'VECTORS'"; CENTER = "'500@10'"; START_TIME = "'$start'"
    STOP_TIME = "'$stop'"; STEP_SIZE = "'$step'"; TIME_TYPE = "'UT'"
    OUT_UNITS = "'AU-D'"; VEC_TABLE = "'2'"; CSV_FORMAT = "'YES'"; VEC_LABELS = "'NO'"
  }
  $query = ($parameters.GetEnumerator() | ForEach-Object {
    '{0}={1}' -f $_.Key, [uri]::EscapeDataString([string]$_.Value)
  }) -join '&'
  $text = (Invoke-WebRequest -UseBasicParsing -Uri "$api`?$query").Content
  $match = [regex]::Match($text, '\$\$SOE\s*([\s\S]*?)\s*\$\$EOE')
  if (-not $match.Success) { throw "Horizons returned no vector table for $target. $($text.Substring(0, [math]::Min(500, $text.Length)))" }
  return @($match.Groups[1].Value.Trim().Split("`n") | Where-Object { $_.Trim() } | ForEach-Object {
    $c = $_.Trim().Split(',') | ForEach-Object { $_.Trim() }
    if ($c.Count -lt 5) { throw "Unexpected Horizons row: $_" }
    [pscustomobject]@{
      jd = [double]$c[0]
      date = ($c[1] -replace '^A\.D\.\s*', '')
      x = [double]$c[2]
      y = [double]$c[3]
      z = [double]$c[4]
    }
  })
}

function Get-MissionRows($target, $mission) {
  $earlyStop = ([datetime]::ParseExact($mission.start, 'yyyy-MM-dd', $null)).AddDays(120).ToString('yyyy-MM-dd')
  $fine = Get-VectorRows $target $mission.start $earlyStop '1d'
  $coarse = Get-VectorRows $target $earlyStop $mission.stop '30d'
  $all = @($fine + $coarse)
  return @($all | Group-Object { $_.jd } | ForEach-Object { $_.Group[0] })
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$records = @()
foreach ($mission in $missions) {
  Write-Host "Downloading $($mission.name), Earth, and Moon vectors..."
  $craft = Get-MissionRows $mission.id $mission
  $earth = Get-MissionRows '399' $mission
  $moon = Get-MissionRows '301' $mission
  if ($craft.Count -ne $earth.Count -or $craft.Count -ne $moon.Count) { throw "$($mission.name), Earth, and Moon returned different sample counts." }
  $points = for ($i = 0; $i -lt $craft.Count; $i++) {
    if ([math]::Abs($craft[$i].jd - $earth[$i].jd) -gt 0.00001 -or [math]::Abs($craft[$i].jd - $moon[$i].jd) -gt 0.00001) { throw "Unmatched dates at row $i for $($mission.name)." }
    [ordered]@{
      jd = [math]::Round($craft[$i].jd, 6); date = $craft[$i].date
      x = [math]::Round($craft[$i].x, 9); y = [math]::Round($craft[$i].y, 9); z = [math]::Round($craft[$i].z, 9)
      earthX = [math]::Round($earth[$i].x, 9); earthY = [math]::Round($earth[$i].y, 9); earthZ = [math]::Round($earth[$i].z, 9)
      moonX = [math]::Round($moon[$i].x, 9); moonY = [math]::Round($moon[$i].y, 9); moonZ = [math]::Round($moon[$i].z, 9)
    }
  }
  $records += [ordered]@{ id = $mission.id; name = $mission.name; launch = $mission.launch; stop = $mission.stop; colour = $mission.colour; points = @($points) }
}

$planetVectors = [ordered]@{}
foreach ($planet in $planets) {
  Write-Host "Downloading $($planet.name) reference positions..."
  $rows = Get-VectorRows $planet.id '1977-08-01' '2030-01-01' '30d'
  $planetVectors[$planet.name] = [ordered]@{
    colour = $planet.colour
    points = @($rows | ForEach-Object { [ordered]@{ jd = [math]::Round($_.jd, 6); x = [math]::Round($_.x, 9); y = [math]::Round($_.y, 9); z = [math]::Round($_.z, 9) } })
  }
}

$dataset = [ordered]@{
  source = 'NASA/JPL Horizons'
  sourceUrl = 'https://ssd.jpl.nasa.gov/horizons/'
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  interval = [ordered]@{ maximumEnd = '2030-01-01 00:00 UT'; earlyStep = '1 day for first 120 days'; laterStep = '30 days' }
  method = 'Geometric heliocentric Cartesian vectors for each spacecraft, Earth, and Moon, in the J2000 ecliptic frame. The first 120 days are sampled daily to support the close-up departure sequence; later positions are sampled every 30 days. Lines between points are illustrative, not navigation data.'
  missions = @($records)
  planets = $planetVectors
}

$json = $dataset | ConvertTo-Json -Depth 6
$json | Set-Content -Encoding utf8 $outFile
"window.MISSION_TRAJECTORY_DATA = $json;" | Set-Content -Encoding utf8 $outJsFile
Write-Host "Wrote $outFile"
Write-Host "Wrote $outJsFile"
