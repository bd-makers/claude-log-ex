class Clogex < Formula
  desc "TUI for exploring Claude Code session logs"
  homepage "https://github.com/bd-makers/claude-log-ex"
  version "0.1.3"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/bd-makers/claude-log-ex/releases/download/v#{version}/clogex-macos-arm64"
      sha256 "50cc9878f73c6ee7bb9ba300c463878959278e7155c980740e4ed6c9bc00ddad"
    end
  end

  def install
    bin.install "clogex-macos-arm64" => "clogex"
  end

  test do
    assert_match "Usage", shell_output("#{bin}/clogex --help 2>&1", 1)
  end
end
