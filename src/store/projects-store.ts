import { reactive } from 'vue'
import type { Project, Release } from '@/types'


export default reactive<{
  repos: Project[],
  releases: Release[],
  setRepos: (repos: Project[]) => void
  setReleases: (releases: Release[]) => void
  getRepoById: (id: string) => Project | null
}>({
  repos: [],
  releases: [],
  setRepos(repos: Project[]) {
    this.repos = repos
  },
  setReleases(releases: Release[]) {
    this.releases = releases
  },
  getRepoById(id) {
    return this.repos.find(repo => {
      return repo.id === id
    }) ?? null
  }
})
